"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionQuerySchema = exports.decisionParamsSchema = exports.updateDecisionStatusSchema = exports.updateDecisionSchema = exports.createDecisionSchema = void 0;
const zod_1 = require("zod");
const priorityEnum = zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
exports.createDecisionSchema = zod_1.z.object({
    evaluationId: zod_1.z.string().uuid('Invalid evaluation ID'),
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(200),
    rationale: zod_1.z.string().max(2000).optional(),
    priority: priorityEnum.optional(),
    responsible: zod_1.z.string().max(100).optional(),
    dueDate: zod_1.z.string().datetime({ offset: true }).optional(),
});
exports.updateDecisionSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200).optional(),
    rationale: zod_1.z.string().max(2000).optional(),
    priority: priorityEnum.optional(),
    responsible: zod_1.z.string().max(100).optional(),
    dueDate: zod_1.z.string().datetime({ offset: true }).optional(),
});
exports.updateDecisionStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PROPOSED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'DONE']),
});
exports.decisionParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid decision ID'),
});
exports.decisionQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    status: zod_1.z.enum(['PROPOSED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'DONE']).optional(),
    priority: priorityEnum.optional(),
    deciderId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=decisions.schema.js.map