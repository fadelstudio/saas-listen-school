import { prisma } from '../../core/database/prisma';
import type { UpdateSystemSettingsInput } from './system.schema';

export const systemRepository = {
  async getSettings(schoolId: string) {
    return prisma.systemSettings.findUnique({
      where: { schoolId }
    });
  },

  async updateSettings(schoolId: string, data: UpdateSystemSettingsInput) {
    return prisma.systemSettings.update({
      where: { schoolId },
      data
    });
  }
};
