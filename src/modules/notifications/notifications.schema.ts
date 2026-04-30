import { z } from 'zod';
import { Role } from '@prisma/client';

// ─── Tous les types de notifications disponibles ──────────────────────────────
export const NotificationTypeEnum = z.enum([
  'AI_FAILURE',
  'EVALUATION_CAMPAIGN',
  'EVALUATION_CAMPAIGN_REMINDER',
  'REPORT_STATUS_CHANGED',
  'NEW_REPORT',
  'SYSTEM',
  'BROADCAST',
  'WELCOME',
]);

export const notificationsSchema = {
  sendBroadcast: z.object({
    title: z.string().min(3).max(150),
    message: z.string().min(5).max(1000),
    // ── Ciblage ──────────────────────────────────────────────────────────────
    // Vous pouvez combiner plusieurs critères. Priorité : userIds > roles > campus > class
    targetRoles: z.array(z.nativeEnum(Role)).optional()
      .describe('Cibler par rôle (ex: STUDENT, MANAGER)'),
    targetCampusIds: z.array(z.string().uuid()).optional()
      .describe('Cibler un ou plusieurs campus'),
    targetClassIds: z.array(z.string().uuid()).optional()
      .describe('Cibler une ou plusieurs classes'),
    targetUserIds: z.array(z.string().uuid()).optional()
      .describe('Cibler des utilisateurs spécifiques par ID'),
    // ── Métadonnées optionnelles ──────────────────────────────────────────────
    url: z.string().url().optional().or(z.literal(''))
      .describe('Lien de redirection (ex: /dashboard/reports/xxx)'),
    attachments: z.any().optional(),
  }),

  query: z.object({
    page: z.string().optional().transform(v => (v ? parseInt(v) : 1)),
    limit: z.string().optional().transform(v => (v ? parseInt(v) : 20)),
    isRead: z.string().optional().transform(v =>
      v === 'true' ? true : v === 'false' ? false : undefined
    ),
    type: NotificationTypeEnum.optional(),
  }),

  params: z.object({
    id: z.string().uuid(),
  }),
};
