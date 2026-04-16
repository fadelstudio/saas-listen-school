import { systemRepository } from './system.repository';
import { UpdateSystemSettingsInput } from './system.schema';
import { SystemSettingsResponse } from './system.types';

// In-memory cache per school
const settingsCache = new Map<string, { data: SystemSettingsResponse, timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export const systemService = {
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
  }
};
