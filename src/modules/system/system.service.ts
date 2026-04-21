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
   * Ne renvoie jamais de valeurs « génériques » d’une autre école : le nom vient de `School` si pas de ligne system_settings.
   */
  async getPublicSettings(schoolId: string) {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true, slug: true },
    });
    if (!school) {
      throw new NotFoundError('School');
    }

    const settings = await prisma.systemSettings.findUnique({
      where: { schoolId },
      select: {
        schoolName: true,
        aiEnabled: true,
        authOtpRequired: true,
        authReportsRequired: true,
        authEvaluationsRequired: true,
        updatedAt: true,
      },
    });

    const base = {
      schoolSlug: school.slug,
      schoolName: settings?.schoolName ?? school.name,
      aiEnabled: settings?.aiEnabled ?? true,
      authOtpRequired: settings?.authOtpRequired ?? false,
      authReportsRequired: settings?.authReportsRequired ?? false,
      authEvaluationsRequired: settings?.authEvaluationsRequired ?? false,
      updatedAt: settings?.updatedAt ?? new Date(0),
    };

    return base;
  },
  async getSettings(schoolId: string, forceRefresh = false): Promise<SystemSettingsResponse> {
    const cached = settingsCache.get(schoolId);
    const now = Date.now();
    
    if (!cached || forceRefresh || (now - cached.timestamp > CACHE_TTL)) {
      const settings = await systemRepository.getSettings(schoolId);
      if (!settings) throw new Error('Settings not found for this school');
      
      const response = settings as unknown as SystemSettingsResponse;
      settingsCache.set(schoolId, { data: response, timestamp: now });
      return response;
    }
    return cached.data;
  },

  async updateSettings(schoolId: string, data: UpdateSystemSettingsInput): Promise<SystemSettingsResponse> {
    const updated = await systemRepository.updateSettings(schoolId, data);
    const response = updated as unknown as SystemSettingsResponse;
    settingsCache.set(schoolId, { data: response, timestamp: Date.now() });
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
    // Save to 'schools' bucket if it exists, fallback to 'attachments'
    let result;
    try {
      result = await uploadsService.uploadFile(file, `logos/${schoolId}`, 'schools');
    } catch (e) {
      result = await uploadsService.uploadFile(file, `logos/${schoolId}`, 'attachments');
    }
    
    await prisma.school.update({
      where: { id: schoolId },
      data: { logoUrl: result.url }
    });

    return { url: result.url };
  }
};
