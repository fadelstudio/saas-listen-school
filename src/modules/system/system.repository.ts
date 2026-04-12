import { prisma } from '../../core/database/prisma';

export const systemRepository = {
  async getSettings() {
    // There is only one row of settings for now (the default-settings created in seed)
    return prisma.systemSettings.findFirst({
      where: { id: 'default-settings' }
    });
  },

  async updateSettings(data: any) {
    return prisma.systemSettings.update({
      where: { id: 'default-settings' },
      data
    });
  }
};
