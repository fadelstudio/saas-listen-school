"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationQuerySchema = exports.evaluationParamsSchema = exports.updateEvaluationSchema = exports.createEvaluationSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const scoreField = (label) => zod_1.z.number().min(0, `${label} min 0`).max(20, `${label} max 20`).optional();
exports.createEvaluationSchema = zod_1.z.object({
    reportId: zod_1.z.string().uuid('Invalid report ID').optional(),
    professorId: zod_1.z.string().uuid('Invalid professor ID'),
    moduleId: zod_1.z.string().uuid('Invalid module ID'),
    classId: zod_1.z.string().uuid('Invalid class ID'),
    score: scoreField('Score'),
    clarityScore: zod_1.z.number().min(0).max(5).optional(),
    pedagogyScore: zod_1.z.number().min(0).max(5).optional(),
    availabilityScore: zod_1.z.number().min(0).max(5).optional(),
    rhythmScore: zod_1.z.number().min(0).max(5).optional(),
    comment: zod_1.z.string().max(2000).optional(),
    isAnonymous: zod_1.z.boolean().optional().default(false),
});
exports.updateEvaluationSchema = zod_1.z.object({
    score: scoreField('Score'),
    clarityScore: zod_1.z.number().min(0).max(5).optional(),
    pedagogyScore: zod_1.z.number().min(0).max(5).optional(),
    availabilityScore: zod_1.z.number().min(0).max(5).optional(),
    rhythmScore: zod_1.z.number().min(0).max(5).optional(),
    comment: zod_1.z.string().max(2000).optional(),
});
exports.evaluationParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid evaluation ID'),
});
exports.evaluationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    status: zod_1.z.nativeEnum(client_1.EvaluationStatus).optional(),
    evaluatorId: zod_1.z.string().uuid().optional(),
    reportId: zod_1.z.string().uuid().optional(),
    startDate: zod_1.z.string().datetime({ offset: true }).optional(),
    endDate: zod_1.z.string().datetime({ offset: true }).optional(),
});
//# sourceMappingURL=evaluations.schema.js.map