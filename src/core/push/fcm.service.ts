import admin from 'firebase-admin';
import { logger } from '../../utils/logger';

/**
 * Firebase Admin SDK — Singleton avec initialisation paresseuse.
 *
 * La clé de service peut être fournie de deux façons :
 *   1. Variable d'env FIREBASE_SERVICE_ACCOUNT_JSON : JSON complet (recommandé sur Railway/Render)
 *   2. Variable d'env FIREBASE_SERVICE_ACCOUNT_PATH : chemin vers le fichier JSON local (dev)
 *
 * Si aucune des deux n'est définie, le service est désactivé (mode silencieux — pas d'erreur fatale).
 */

let _messaging: admin.messaging.Messaging | null = null;
let _initialized = false;
let _disabled = false;

function initFirebase(): boolean {
  if (_initialized) return !_disabled;

  _initialized = true;

  try {
    const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const pathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (!jsonEnv && !pathEnv) {
      logger.warn('[FCM] Firebase désactivé : aucune configuration FIREBASE_SERVICE_ACCOUNT_JSON ou FIREBASE_SERVICE_ACCOUNT_PATH trouvée.');
      _disabled = true;
      return false;
    }

    let serviceAccount: admin.ServiceAccount;

    if (jsonEnv) {
      try {
        let cleanJson = jsonEnv.trim();

        // REPARATION 1 : Si le JSON est entouré de guillemets (erreur Railway classique)
        if (cleanJson.startsWith('"') && cleanJson.endsWith('"')) {
          cleanJson = cleanJson.substring(1, cleanJson.length - 1);
        }

        // REPARATION 2 : Si les guillemets internes sont échappés (\")
        cleanJson = cleanJson.replace(/\\"/g, '"');

        // REPARATION 3 : Si les retours à la ligne sont échappés (\\n)
        cleanJson = cleanJson.replace(/\\n/g, '\n');

        const parsed = JSON.parse(cleanJson);
        // La clé brute du JSON Google est en snake_case (private_key, project_id)
        // Mais le type SDK ServiceAccount attend du camelCase (privateKey, projectId)
        const raw = parsed as any;

        // Note: raw.private_key a déjà été traité par le replace global plus haut s'il était échappé
        serviceAccount = {
          projectId: raw.project_id,
          clientEmail: raw.client_email,
          privateKey: raw.private_key,
        };

        logger.info('[FCM] JSON parsé et clé privée formatée avec succès.');

        if (!serviceAccount.privateKey || !serviceAccount.projectId) {
          logger.error('[FCM] Erreur : privateKey ou projectId manquant dans le JSON !');
          _disabled = true;
          return false;
        }
      } catch (parseErr: any) {
        logger.error('[FCM] Erreur FATALE de parsing JSON. Vérifie les guillemets sur Railway.', {
          error: parseErr.message,
          inputStart: jsonEnv.substring(0, 30) + '...',
        });
        _disabled = true;
        return false;
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      serviceAccount = require(pathEnv!) as admin.ServiceAccount;
    }

    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }

      _messaging = admin.messaging();
      logger.info('[FCM] Firebase Admin SDK initialisé avec succès.');
      return true;
    } catch (authErr: any) {
      logger.error('[FCM] Erreur d\'authentification Google (clé invalide ?).', { 
        message: authErr.message,
        code: authErr.code 
      });
      _disabled = true;
      return false;
    }
  } catch (err: any) {
    logger.error('[FCM] Erreur inattendue lors de l\'initialisation.', { error: err.message });
    _disabled = true;
    return false;
  }
}

export interface FcmPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface FcmBatchPayload {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export const fcmService = {
  /**
   * Indique si Firebase est correctement configuré et actif.
   */
  isEnabled(): boolean {
    return initFirebase();
  },

  /**
   * Envoie un push à un seul appareil.
   * Retourne silencieusement false si FCM est désactivé ou si le token est invalide.
   */
  async sendToDevice(payload: FcmPayload): Promise<boolean> {
    if (!this.isEnabled() || !_messaging) return false;
    if (!payload.token?.trim()) return false;

    try {
      await _messaging.send({
        token: payload.token,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
        webpush: {
          notification: {
            icon: '/images/logo-icon.svg',
            badge: '/images/favicon.ico',
          },
        },
      });
      return true;
    } catch (err: any) {
      // Token expiré ou invalide → on log en warn (pas error) pour éviter le bruit
      if (err?.code === 'messaging/registration-token-not-registered' ||
          err?.code === 'messaging/invalid-registration-token') {
        logger.warn('[FCM] Token FCM invalide ou expiré, ignoré.', { token: payload.token.slice(0, 20) + '...' });
      } else {
        logger.error('[FCM] Erreur lors de l\'envoi du push.', { error: err?.message });
      }
      return false;
    }
  },

  /**
   * Envoie un push à plusieurs appareils (max 500 par batch Firebase).
   * Retourne le nombre de succès.
   */
  async sendToMultipleDevices(payload: FcmBatchPayload): Promise<number> {
    if (!this.isEnabled() || !_messaging) return 0;

    const validTokens = [...new Set(payload.tokens.filter(t => t?.trim().length > 0))];
    if (validTokens.length === 0) return 0;

    // Firebase multicast max 500 tokens par appel
    const BATCH_SIZE = 500;
    let successCount = 0;

    for (let i = 0; i < validTokens.length; i += BATCH_SIZE) {
      const batch = validTokens.slice(i, i + BATCH_SIZE);
      try {
        const response = await _messaging.sendEachForMulticast({
          tokens: batch,
          notification: {
            title: payload.title,
            body: payload.body,
            imageUrl: payload.imageUrl,
          },
          data: payload.data,
          android: { priority: 'high' },
          apns: { payload: { aps: { sound: 'default' } } },
        });
        successCount += response.successCount;

        // Log les tokens qui ont échoué
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            logger.warn('[FCM] Batch push échoué pour un token.', {
              error: resp.error?.message,
              tokenPrefix: batch[idx]?.slice(0, 20),
            });
          }
        });
      } catch (err: any) {
        logger.error('[FCM] Erreur batch multicast.', { error: err?.message });
      }
    }

    return successCount;
  },

  /**
   * Envoie un push à un topic Firebase (ex: "school_afi_all").
   * Utile pour des broadcasts ultra-larges sans lister les tokens.
   */
  async sendToTopic(topic: string, payload: Omit<FcmPayload, 'token'>): Promise<boolean> {
    if (!this.isEnabled() || !_messaging) return false;

    try {
      await _messaging.send({
        topic,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      });
      return true;
    } catch (err: any) {
      logger.error('[FCM] Erreur envoi topic.', { error: err?.message, topic });
      return false;
    }
  },
};
