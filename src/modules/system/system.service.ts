import { systemRepository } from './system.repository';
import { UpdateSystemSettingsInput } from './system.schema';
import { SystemSettingsResponse } from './system.types';

// Simple in-memory cache to avoid DB hit on every request
let settingsCache: SystemSettingsResponse | null = null;
let lastFetch: number = 0;
const CACHE_TTL = 30000; // 30 seconds

export const systemService = {
  async getSettings(forceRefresh = false): Promise<SystemSettingsResponse> {
    const now = Date.now();
    if (!settingsCache || forceRefresh || (now - lastFetch > CACHE_TTL)) {
      settingsCache = await systemRepository.getSettings();
      lastFetch = now;
    }
    return settingsCache!;
  },

  async updateSettings(data: UpdateSystemSettingsInput): Promise<SystemSettingsResponse> {
    const updated = await systemRepository.updateSettings(data);
    settingsCache = updated; // Update cache
    lastFetch = Date.now();
    return updated;
  }
};
