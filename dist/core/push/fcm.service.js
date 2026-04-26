"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fcmService = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const logger_1 = require("../../utils/logger");
/**
 * Firebase Admin SDK — Singleton avec initialisation paresseuse.
 *
 * La clé de service peut être fournie de deux façons :
 *   1. Variable d'env FIREBASE_SERVICE_ACCOUNT_JSON : JSON complet (recommandé sur Railway/Render)
 *   2. Variable d'env FIREBASE_SERVICE_ACCOUNT_PATH : chemin vers le fichier JSON local (dev)
 *
 * Si aucune des deux n'est définie, le service est désactivé (mode silencieux — pas d'erreur fatale).
 */
let _messaging = null;
let _initialized = false;
let _disabled = false;
function initFirebase() {
    if (_initialized)
        return !_disabled;
    _initialized = true;
    try {
        const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        const pathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        if (!jsonEnv && !pathEnv) {
            logger_1.logger.warn('[FCM] Firebase désactivé : aucune configuration FIREBASE_SERVICE_ACCOUNT_JSON ou FIREBASE_SERVICE_ACCOUNT_PATH trouvée.');
            _disabled = true;
            return false;
        }
        let serviceAccount;
        if (jsonEnv) {
            serviceAccount = JSON.parse(jsonEnv);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            serviceAccount = require(pathEnv);
        }
        if (!firebase_admin_1.default.apps.length) {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount),
            });
        }
        _messaging = firebase_admin_1.default.messaging();
        logger_1.logger.info('[FCM] Firebase Admin SDK initialisé avec succès.');
        return true;
    }
    catch (err) {
        logger_1.logger.error('[FCM] Échec de l\'initialisation Firebase. Le push FCM est désactivé.', { error: err });
        _disabled = true;
        return false;
    }
}
exports.fcmService = {
    /**
     * Indique si Firebase est correctement configuré et actif.
     */
    isEnabled() {
        return initFirebase();
    },
    /**
     * Envoie un push à un seul appareil.
     * Retourne silencieusement false si FCM est désactivé ou si le token est invalide.
     */
    async sendToDevice(payload) {
        if (!this.isEnabled() || !_messaging)
            return false;
        if (!payload.token?.trim())
            return false;
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
                        icon: '/icon-192x192.png',
                        badge: '/badge-72x72.png',
                    },
                },
            });
            return true;
        }
        catch (err) {
            // Token expiré ou invalide → on log en warn (pas error) pour éviter le bruit
            if (err?.code === 'messaging/registration-token-not-registered' ||
                err?.code === 'messaging/invalid-registration-token') {
                logger_1.logger.warn('[FCM] Token FCM invalide ou expiré, ignoré.', { token: payload.token.slice(0, 20) + '...' });
            }
            else {
                logger_1.logger.error('[FCM] Erreur lors de l\'envoi du push.', { error: err?.message });
            }
            return false;
        }
    },
    /**
     * Envoie un push à plusieurs appareils (max 500 par batch Firebase).
     * Retourne le nombre de succès.
     */
    async sendToMultipleDevices(payload) {
        if (!this.isEnabled() || !_messaging)
            return 0;
        const validTokens = payload.tokens.filter(t => t?.trim().length > 0);
        if (validTokens.length === 0)
            return 0;
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
                        logger_1.logger.warn('[FCM] Batch push échoué pour un token.', {
                            error: resp.error?.message,
                            tokenPrefix: batch[idx]?.slice(0, 20),
                        });
                    }
                });
            }
            catch (err) {
                logger_1.logger.error('[FCM] Erreur batch multicast.', { error: err?.message });
            }
        }
        return successCount;
    },
    /**
     * Envoie un push à un topic Firebase (ex: "school_afi_all").
     * Utile pour des broadcasts ultra-larges sans lister les tokens.
     */
    async sendToTopic(topic, payload) {
        if (!this.isEnabled() || !_messaging)
            return false;
        try {
            await _messaging.send({
                topic,
                notification: { title: payload.title, body: payload.body },
                data: payload.data,
                android: { priority: 'high' },
                apns: { payload: { aps: { sound: 'default' } } },
            });
            return true;
        }
        catch (err) {
            logger_1.logger.error('[FCM] Erreur envoi topic.', { error: err?.message, topic });
            return false;
        }
    },
};
//# sourceMappingURL=fcm.service.js.map