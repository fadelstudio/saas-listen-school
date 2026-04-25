"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.notificationsSchema = {
    sendBroadcast: zod_1.z.object({
        title: zod_1.z.string().min(3).max(100),
        message: zod_1.z.string().min(5),
        targetRoles: zod_1.z.array(zod_1.z.nativeEnum(client_1.Role)).optional(),
        targetCampusIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
        targetClassIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
        targetUserIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
        url: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        attachments: zod_1.z.any().optional(),
    }),
    query: zod_1.z.object({
        page: zod_1.z.string().optional().transform(v => (v ? parseInt(v) : 1)),
        limit: zod_1.z.string().optional().transform(v => (v ? parseInt(v) : 20)),
        isRead: zod_1.z.string().optional().transform(v => (v === 'true' ? true : v === 'false' ? false : undefined)),
        type: zod_1.z.enum(['AI_FAILURE', 'EVALUATION_CAMPAIGN', 'EVALUATION_CAMPAIGN_REMINDER', 'SYSTEM', 'BROADCAST']).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
};
//# sourceMappingURL=notifications.schema.js.map