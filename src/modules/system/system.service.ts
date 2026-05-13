/// <reference types="multer" />
import { systemRepository } from './system.repository';
import { UpdateSystemSettingsInput } from './system.schema';
import { SystemSettingsResponse } from './system.types';
import { prisma } from '../../core/database/prisma';
import { NotFoundError } from '../../core/errors/AppError';

// In-memory cache per school
const settingsCache = new Map<string, { data: SystemSettingsResponse, timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export const systemService = {
  /**
   * Toggles publics pour l’école résolue par le middleware (req.schoolId).
   * Utilise le cache interne pour garantir une mise à jour instantanée après modif admin.
   */
  async getPublicSettings(schoolId: string) {
    // On récupère les settings via la fonction qui gère le cache
    const settings = await this.getSettings(schoolId);
    
    // On récupère les infos de l'école (slug, logo)
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true, slug: true, logoUrl: true },
    });
    
    if (!school) throw new NotFoundError('School');

    let finalLogoUrl = school.logoUrl;
    if (finalLogoUrl && finalLogoUrl.includes('/object/sign/')) {
      try {
        const urlObj = new URL(finalLogoUrl);
        urlObj.pathname = urlObj.pathname.replace('/object/sign/', '/object/public/');
        urlObj.search = '';
        finalLogoUrl = urlObj.toString();
      } catch (e) {
        // Ignore invalid URLs
      }
    }

    return {
      schoolSlug: school.slug,
      schoolName: settings.schoolName || school.name,
      logoUrl: finalLogoUrl,
      aiEnabled: settings.aiEnabled,
      authOtpRequired: settings.authOtpRequired,
      authReportsRequired: settings.authReportsRequired,
      authEvaluationsRequired: settings.authEvaluationsRequired,
      updatedAt: settings.updatedAt,
    };
  },
  async getSettings(schoolId: string, forceRefresh = false): Promise<SystemSettingsResponse> {
    const cached = settingsCache.get(schoolId);
    const now = Date.now();
    
    if (!cached || forceRefresh || (now - cached.timestamp > CACHE_TTL)) {
      const settings = await systemRepository.getSettings(schoolId);
      if (!settings) throw new Error('Settings not found for this school');
      
      const response = { ...settings, logoUrl: (settings as any).school?.logoUrl } as unknown as SystemSettingsResponse;
      delete (response as any).school;
      
      settingsCache.set(schoolId, { data: response, timestamp: now });
      return response;
    }
    return cached.data;
  },

  async updateSettings(schoolId: string, data: UpdateSystemSettingsInput): Promise<SystemSettingsResponse> {
    // Si des configs IA sont envoyées, on gère la persistance des apiKeys sensibles
    if (data.aiConfigs) {
      const oldSettings = await this.getSettings(schoolId, true);
      const oldConfigs = (oldSettings.aiConfigs as any[]) || [];

      data.aiConfigs = data.aiConfigs.map(newCfg => {
        // Si l'apiKey est vide, on tente de récupérer l'ancienne pour cet ID
        if (!newCfg.apiKey || newCfg.apiKey === "") {
          const matchingOld = oldConfigs.find(old => old.id === newCfg.id);
          if (matchingOld && matchingOld.apiKey) {
            return { ...newCfg, apiKey: matchingOld.apiKey };
          }
        }
        return newCfg;
      });
    }

    const updated = await systemRepository.updateSettings(schoolId, data);
    const response = updated as unknown as SystemSettingsResponse;
    settingsCache.set(schoolId, { data: response, timestamp: Date.now() });

    // Invalider le cache du balancer pour forcer la prise en compte immédiate (ex: override)
    const { aiBalancer } = await import('../../core/ai/AiBalancer');
    await aiBalancer.clearCache();

    return response;
  },

  async getAvailableModels() {
    const { FALLBACK_TOP5 } = await import('../../core/ai/ModelDiscovery');
    return Object.entries(FALLBACK_TOP5).map(([provider, models]) => ({
      provider,
      models: models.map(m => ({ value: m.id, label: m.name }))
    }));
  },

  async updateLogo(schoolId: string, file: Express.Multer.File) {
    const { uploadsService } = await import('../uploads/uploads.service');
    
    // Attempt multiple common bucket names
    const buckets = ['schools', 'logos', 'attachments', 'public', 'general', 'files'];
    let result;
    let lastError;

    for (const bucket of buckets) {
      try {
        result = await uploadsService.uploadFile(file, `logos/${schoolId}`, bucket);
        if (result) break;
      } catch (e) {
        lastError = e;
        console.warn(`⚠️ Bucket '${bucket}' not found or error, trying next...`);
      }
    }

    if (!result) {
      throw lastError || new Error('All storage buckets failed. Please check Supabase configuration.');
    }
    
    let finalUrl = result.url;
    if (finalUrl && finalUrl.includes('/object/sign/')) {
      try {
        const urlObj = new URL(finalUrl);
        urlObj.pathname = urlObj.pathname.replace('/object/sign/', '/object/public/');
        urlObj.search = '';
        finalUrl = urlObj.toString();
      } catch (e) {
        // Fallback
      }
    }

    await prisma.school.update({
      where: { id: schoolId },
      data: { logoUrl: finalUrl }
    });

    settingsCache.delete(schoolId);

    return { url: finalUrl };
  },

  /**
   * Récupère les données nécessaires pour remplir les formulaires (Signalements, Évaluations)
   * sans authentification. Utile pour le mode invité du mobile.
   */
  async getPublicFormData(schoolId: string) {
    const [campuses, professors, types, priorities, modules] = await Promise.all([
      prisma.campus.findMany({
        where: { schoolId },
        select: { id: true, name: true },
      }),
      prisma.professor.findMany({
        where: { schoolId },
        select: { 
          id: true, 
          firstName: true, 
          lastName: true,
          modules: {
            select: { classId: true, moduleId: true }
          }
        },
      }),

      // Enums ReportType et Priority
      Promise.resolve(['PROBLEM_MATERIAL', 'PROBLEM_ADMIN', 'PROBLEM_PEDAGOGICAL', 'INCIDENT', 'SUGGESTION', 'OTHER']),
      Promise.resolve(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      prisma.module.findMany({
        where: { schoolId },
        select: { 
          id: true, 
          name: true, 
          classModules: {
            select: { classId: true }
          }
        },
      })
    ]);

    // On récupère aussi les classes liées aux campus
    const classes = await prisma.class.findMany({
      where: { campus: { schoolId } },
      select: { id: true, name: true, campusId: true },
    });

    return {
      campuses,
      classes,
      professors: professors.map(p => ({ 
        id: p.id, 
        name: `${p.firstName} ${p.lastName}`,
        targetClassIds: Array.from(new Set(p.modules.map(m => m.classId))),
        targetModuleIds: Array.from(new Set(p.modules.map(m => m.moduleId)))
      })),

      modules: modules.map(m => ({
        id: m.id,
        name: m.name,
        targetClassIds: m.classModules.map(cm => cm.classId)
      })),
      types,
      priorities,
    };

  }
};
