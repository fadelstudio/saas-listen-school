import { prisma } from '../../core/database/prisma';
import type { UpdateSystemSettingsInput } from './system.schema';

export const systemRepository = {
  async getSettings() {
    // There is only one row of settings for now (the default-settings created in seed)
    return prisma.systemSettings.findFirst({
      where: { id: 'default-settings' }
    });
  },

  async updateSettings(data: UpdateSystemSettingsInput) {
    return prisma.systemSettings.update({
      where: { id: 'default-settings' },
      data
    });
  }
};
