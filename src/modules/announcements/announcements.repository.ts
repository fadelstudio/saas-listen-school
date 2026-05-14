import { prisma } from '../../core/database/prisma';
import { CreateAnnouncementInput, UpdateAnnouncementInput } from './announcements.types';

export const announcementsRepository = {
  async create(schoolId: string, data: CreateAnnouncementInput) {
    return prisma.announcement.create({
      data: {
        ...data,
        schoolId,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  },

  async findById(id: string, schoolId: string) {
    return prisma.announcement.findFirst({
      where: { id, schoolId },
    });
  },

  async findAll(schoolId: string) {
    return prisma.announcement.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findActive(schoolId: string) {
    return prisma.announcement.findFirst({
      where: { schoolId, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async update(id: string, schoolId: string, data: UpdateAnnouncementInput) {
    return prisma.announcement.updateMany({
      where: { id, schoolId },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  },

  async deactivateAll(schoolId: string) {
    return prisma.announcement.updateMany({
      where: { schoolId, isActive: true },
      data: { isActive: false },
    });
  },

  async delete(id: string, schoolId: string) {
    return prisma.announcement.deleteMany({
      where: { id, schoolId },
    });
  },
};
