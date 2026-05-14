import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(5000).optional(),
  imagePath: z.string().max(500).optional().or(z.literal('')),
  imageUrl: z.string().max(500).optional().or(z.literal('')), // Legacy support
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

export const announcementParamsSchema = z.object({
  id: z.string().uuid('Invalid announcement ID'),
});
