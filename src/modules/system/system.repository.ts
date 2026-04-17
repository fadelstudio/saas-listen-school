import { prisma } from '../../core/database/prisma';
import type { UpdateSystemSettingsInput } from './system.schema';
import { Prisma } from '@prisma/client';

export const systemRepository = {
  async getSettings(schoolId: string) {
    try {
      return await prisma.systemSettings.findUnique({
        where: { schoolId }
      });
    } catch (error) {
      // Legacy single-school databases may not have system_settings.schoolId yet.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2022'
      ) {
        return prisma.systemSettings.findFirst();
      }
      throw error;
    }
  },

  async updateSettings(schoolId: string, data: UpdateSystemSettingsInput) {
    try {
      return await prisma.systemSettings.update({
        where: { schoolId },
        data
      });
    } catch (error) {
      // Legacy single-school fallback: patch the first settings row.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2022'
      ) {
        const existing = await prisma.systemSettings.findFirst({
          select: { id: true },
        });
        if (!existing) {
          return (prisma as any).systemSettings.create({
            data: {
              schoolName: data.schoolName ?? 'AFI',
              authReportsRequired: data.authReportsRequired ?? false,
              authEvaluationsRequired: data.authEvaluationsRequired ?? false,
              aiEnabled: data.aiEnabled ?? true,
              aiConfigs: data.aiConfigs ?? [],
              aiOverrideConfigId: data.aiOverrideConfigId ?? null,
            },
          });
        }
        return prisma.systemSettings.update({
          where: { id: existing.id },
          data,
        });
      }
      throw error;
    }
  }
};
