import { prisma } from '../../core/database/prisma';
import type { UpdateSystemSettingsInput } from './system.schema';
import { Prisma } from '@prisma/client';
export const systemRepository = {
  async getSettings(schoolId: string) {
    try {
      return await prisma.systemSettings.findUnique({
        where: { schoolId },
        include: { school: { select: { logoUrl: true } } }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2022') {
        return prisma.systemSettings.findFirst({
          include: { school: { select: { logoUrl: true } } }
        });
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
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2022') {
        const first = await prisma.systemSettings.findFirst({ select: { id: true } });
        if (!first) {
          throw error;
        }
        return prisma.systemSettings.update({
          where: { id: first.id },
          data,
        });
      }
      throw error;
    }
  }
};
