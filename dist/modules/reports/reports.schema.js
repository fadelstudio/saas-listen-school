"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportQuerySchema = exports.reportParamsSchema = exports.updateReportStatusSchema = exports.updateReportSchema = exports.createReportSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const reportTypeEnum = zod_1.z.enum([
    'PROBLEM_MATERIAL',
    'PROBLEM_ADMIN',
    'PROBLEM_PEDAGOGICAL',
    'INCIDENT',
    'SUGGESTION',
    'OTHER',
]);
const priorityEnum = zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
// ─── Create ───────────────────────────────────────────────────────────────────
exports.createReportSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(200),
    content: zod_1.z.string().min(10, 'Content must be at least 10 characters').max(5000),
    type: reportTypeEnum,
    category: zod_1.z.string().max(100).optional(),
    priority: priorityEnum,
    isAnonymous: zod_1.z.boolean().optional().default(false),
    classId: zod_1.z.string().uuid('Invalid class ID').optional().nullable(),
    professorId: zod_1.z.string().uuid('Invalid professor ID').optional().nullable(),
    moduleId: zod_1.z.string().uuid('Invalid module ID').optional().nullable(),
    uti: zod_1.z.string().optional().nullable(),
    attachments: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        url: zod_1.z.string().url(),
        type: zod_1.z.string(),
        size: zod_1.z.number().optional(),
        duration: zod_1.z.number().optional(),
    })).optional(),
});
// ─── Update ───────────────────────────────────────────────────────────────────
exports.updateReportSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200).optional(),
    content: zod_1.z.string().min(10).max(5000).optional(),
    type: reportTypeEnum.optional(),
    category: zod_1.z.string().max(100).optional(),
    priority: priorityEnum.optional(),
});
// ─── Update Status ────────────────────────────────────────────────────────────
exports.updateReportStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.ReportStatus),
});
// ─── Params ───────────────────────────────────────────────────────────────────
exports.reportParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid report ID'),
});
// ─── Query (list + filters) ───────────────────────────────────────────────────
exports.reportQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    status: zod_1.z.nativeEnum(client_1.ReportStatus).optional(),
    priority: priorityEnum.optional(),
    isAnonymous: zod_1.z
        .string()
        .transform((v) => v === 'true')
        .optional(),
    startDate: zod_1.z.string().datetime({ offset: true }).optional(),
    endDate: zod_1.z.string().datetime({ offset: true }).optional(),
    search: zod_1.z.string().max(200).optional(),
});
//# sourceMappingURL=reports.schema.js.map