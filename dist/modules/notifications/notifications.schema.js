"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsSchema = exports.NotificationTypeEnum = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// ─── Tous les types de notifications disponibles ──────────────────────────────
exports.NotificationTypeEnum = zod_1.z.enum([
    'AI_FAILURE',
    'EVALUATION_CAMPAIGN',
    'EVALUATION_CAMPAIGN_REMINDER',
    'REPORT_STATUS_CHANGED',
    'NEW_REPORT',
    'SYSTEM',
    'BROADCAST',
    'WELCOME',
]);
exports.notificationsSchema = {
    sendBroadcast: zod_1.z.object({
        title: zod_1.z.string().min(3).max(150),
        message: zod_1.z.string().min(5).max(1000),
        // ── Ciblage ──────────────────────────────────────────────────────────────
        // Vous pouvez combiner plusieurs critères. Priorité : userIds > roles > campus > class
        targetRoles: zod_1.z.array(zod_1.z.nativeEnum(client_1.Role)).optional()
            .describe('Cibler par rôle (ex: STUDENT, MANAGER)'),
        targetCampusIds: zod_1.z.array(zod_1.z.string().uuid()).optional()
            .describe('Cibler un ou plusieurs campus'),
        targetClassIds: zod_1.z.array(zod_1.z.string().uuid()).optional()
            .describe('Cibler une ou plusieurs classes'),
        targetUserIds: zod_1.z.array(zod_1.z.string().uuid()).optional()
            .describe('Cibler des utilisateurs spécifiques par ID'),
        // ── Métadonnées optionnelles ──────────────────────────────────────────────
        url: zod_1.z.string().url().optional().or(zod_1.z.literal(''))
            .describe('Lien de redirection (ex: /dashboard/reports/xxx)'),
        attachments: zod_1.z.any().optional(),
    }),
    query: zod_1.z.object({
        page: zod_1.z.string().optional().transform(v => (v ? parseInt(v) : 1)),
        limit: zod_1.z.string().optional().transform(v => (v ? parseInt(v) : 20)),
        isRead: zod_1.z.string().optional().transform(v => v === 'true' ? true : v === 'false' ? false : undefined),
        type: exports.NotificationTypeEnum.optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
};
//# sourceMappingURL=notifications.schema.js.map