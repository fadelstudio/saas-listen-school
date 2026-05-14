"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementParamsSchema = exports.updateAnnouncementSchema = exports.createAnnouncementSchema = void 0;
const zod_1 = require("zod");
exports.createAnnouncementSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: zod_1.z.string().max(5000).optional(),
    imageUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    startDate: zod_1.z.string().datetime({ offset: true }).optional(),
    endDate: zod_1.z.string().datetime({ offset: true }).optional().nullable(),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateAnnouncementSchema = exports.createAnnouncementSchema.partial();
exports.announcementParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid announcement ID'),
});
//# sourceMappingURL=announcements.schema.js.map