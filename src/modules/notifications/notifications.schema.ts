import { z } from 'zod';
import { Role } from '@prisma/client';

export const notificationsSchema = {
  sendBroadcast: z.object({
    title: z.string().min(3).max(100),
    message: z.string().min(5),
    targetRoles: z.array(z.nativeEnum(Role)).optional(),
    targetCampusIds: z.array(z.string().uuid()).optional(),
    targetClassIds: z.array(z.string().uuid()).optional(),
    targetUserIds: z.array(z.string().uuid()).optional(),
    url: z.string().url().optional().or(z.literal('')),
    attachments: z.any().optional(),
  }),

  query: z.object({
    page: z.string().optional().transform(v => (v ? parseInt(v) : 1)),
    limit: z.string().optional().transform(v => (v ? parseInt(v) : 20)),
    isRead: z.string().optional().transform(v => (v === 'true' ? true : v === 'false' ? false : undefined)),
    type: z.enum(['AI_FAILURE', 'EVALUATION_CAMPAIGN', 'EVALUATION_CAMPAIGN_REMINDER', 'SYSTEM', 'BROADCAST']).optional(),
  }),

  params: z.object({
    id: z.string().uuid(),
  }),
};
