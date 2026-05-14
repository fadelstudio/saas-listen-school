import { announcementsRepository } from './announcements.repository';
import { CreateAnnouncementInput, UpdateAnnouncementInput } from './announcements.types';
import { NotFoundError, ForbiddenError } from '../../core/errors/AppError';
import { notificationService } from '../notifications/notifications.service';

export const announcementsService = {
  async create(schoolId: string, data: CreateAnnouncementInput, userRole: string) {
    if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole)) {
      throw new ForbiddenError('Only admins can create announcements');
    }

    if (data.isActive) {
      await announcementsRepository.deactivateAll(schoolId);
    }

    const announcement = await announcementsRepository.create(schoolId, data);

    if (announcement.isActive) {
      await this.notifyActivation(schoolId, announcement);
    }

    return announcement;
  },

  async getAll(schoolId: string) {
    return announcementsRepository.findAll(schoolId);
  },

  async getActive(schoolId: string) {
    return announcementsRepository.findActive(schoolId);
  },

  async update(id: string, schoolId: string, data: UpdateAnnouncementInput, userRole: string) {
    if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole)) {
      throw new ForbiddenError('Only admins can update announcements');
    }

    const existing = await announcementsRepository.findById(id, schoolId);
    if (!existing) throw new NotFoundError('Announcement');

    if (data.isActive && !existing.isActive) {
      await announcementsRepository.deactivateAll(schoolId);
    }

    await announcementsRepository.update(id, schoolId, data);
    const updated = await announcementsRepository.findById(id, schoolId);

    if (data.isActive && !existing.isActive && updated) {
      await this.notifyActivation(schoolId, updated);
    }

    return updated;
  },

  async delete(id: string, schoolId: string, userRole: string) {
    if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole)) {
      throw new ForbiddenError('Only admins can delete announcements');
    }
    return announcementsRepository.delete(id, schoolId);
  },

  async notifyActivation(schoolId: string, announcement: any) {
    try {
      await notificationService.sendBroadcast(schoolId, {
        title: `📢 Nouvelle annonce : ${announcement.title}`,
        message: announcement.description || 'Une nouvelle annonce est disponible.',
        type: 'ANNOUNCEMENT',
        url: announcement.imageUrl ? announcement.imageUrl : undefined,
      });
    } catch (error) {
      console.warn('[AnnouncementsService] Failed to send activation notification', error);
    }
  }
};
