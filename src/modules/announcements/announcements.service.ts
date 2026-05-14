import { announcementsRepository } from './announcements.repository';
import { CreateAnnouncementInput, UpdateAnnouncementInput } from './announcements.types';
import { NotFoundError, ForbiddenError } from '../../core/errors/AppError';
import { notificationService } from '../notifications/notifications.service';
import { uploadsService } from '../uploads/uploads.service';

const ONE_YEAR_SECONDS = 3600 * 24 * 365;

async function enrichAnnouncementWithUrl(ann: any) {
  if (!ann) return ann;
  const path = ann.imagePath || ann.imageUrl;
  if (!path) return { ...ann, imageUrl: null };

  // Calculate duration based on announcement endDate
  let duration = ONE_YEAR_SECONDS;
  if (ann.endDate) {
    const remaining = Math.floor((new Date(ann.endDate).getTime() - Date.now()) / 1000);
    if (remaining > 0) {
      duration = remaining + 3600; // Buffer of 1 hour
    }
  }

  const imageUrl = await uploadsService.getSignedUrlForPath(path, duration);
  return { ...ann, imageUrl };
}

export const announcementsService = {
  async create(schoolId: string, input: CreateAnnouncementInput & { imageUrl?: string }, userRole: string) {
    if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole)) {
      throw new ForbiddenError('Only admins can create announcements');
    }

    // Handle imageUrl -> imagePath mapping for backward compatibility in form
    const data = { ...input };
    if (data.imageUrl && !data.imagePath) {
      // If it's a signed URL from Supabase, try to extract the path
      if (data.imageUrl.includes('storage/v1/object/sign/')) {
         // Extract path from Supabase signed URL: .../sign/bucket/folder/file?token=...
         const parts = data.imageUrl.split('?')[0].split('/object/sign/')[1]?.split('/');
         if (parts && parts.length > 1) {
           data.imagePath = parts.slice(1).join('/'); // Skip bucket name
         }
      } else if (!data.imageUrl.startsWith('http')) {
        data.imagePath = data.imageUrl;
      }
    }
    delete data.imageUrl;

    if (data.isActive) {
      await announcementsRepository.deactivateAll(schoolId);
    }

    const announcement = await announcementsRepository.create(schoolId, data);

    const enriched = await enrichAnnouncementWithUrl(announcement);
    if (enriched.isActive) {
      await this.notifyActivation(schoolId, enriched);
    }

    return enriched;
  },

  async getAll(schoolId: string) {
    const items = await announcementsRepository.findAll(schoolId);
    return Promise.all(items.map(enrichAnnouncementWithUrl));
  },

  async getActive(schoolId: string) {
    const ann = await announcementsRepository.findActive(schoolId);
    return enrichAnnouncementWithUrl(ann);
  },

  async update(id: string, schoolId: string, input: UpdateAnnouncementInput & { imageUrl?: string }, userRole: string) {
    if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole)) {
      throw new ForbiddenError('Only admins can update announcements');
    }

    const data = { ...input };
    if (data.imageUrl && !data.imagePath) {
       if (data.imageUrl.includes('storage/v1/object/sign/')) {
         const parts = data.imageUrl.split('?')[0].split('/object/sign/')[1]?.split('/');
         if (parts && parts.length > 1) {
           data.imagePath = parts.slice(1).join('/');
         }
      } else if (!data.imageUrl.startsWith('http')) {
        data.imagePath = data.imageUrl;
      }
    }
    delete data.imageUrl;

    const existing = await announcementsRepository.findById(id, schoolId);
    if (!existing) throw new NotFoundError('Announcement');

    if (data.isActive && !existing.isActive) {
      await announcementsRepository.deactivateAll(schoolId);
    }

    await announcementsRepository.update(id, schoolId, data);
    const updated = await announcementsRepository.findById(id, schoolId);

    const enriched = await enrichAnnouncementWithUrl(updated);
    if (data.isActive && !existing.isActive && enriched) {
      await this.notifyActivation(schoolId, enriched);
    }

    return enriched;
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
