"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationCampaignQuerySchema = exports.createEvaluationCampaignSchema = exports.evaluationCampaignIdParamsSchema = void 0;
const zod_1 = require("zod");
const idSchema_1 = require("../../utils/idSchema");
exports.evaluationCampaignIdParamsSchema = zod_1.z.object({
    id: idSchema_1.idStringSchema,
});
exports.createEvaluationCampaignSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
    scope: zod_1.z.enum(['CLASS', 'CAMPUS', 'SCHOOL']).default('CLASS'),
    classId: idSchema_1.idStringSchema.optional(),
    campusId: idSchema_1.idStringSchema.optional(),
    moduleId: idSchema_1.idStringSchema,
    professorId: idSchema_1.idStringSchema,
    dueDate: zod_1.z.string().datetime({ offset: true }),
}).superRefine((val, ctx) => {
    if (val.scope === 'CLASS' && !val.classId) {
        ctx.addIssue({ code: 'custom', message: 'classId is required when scope=CLASS', path: ['classId'] });
    }
    if (val.scope === 'CAMPUS' && !val.campusId) {
        ctx.addIssue({ code: 'custom', message: 'campusId is required when scope=CAMPUS', path: ['campusId'] });
    }
});
exports.evaluationCampaignQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    classId: idSchema_1.idStringSchema.optional(),
    campusId: idSchema_1.idStringSchema.optional(),
    scope: zod_1.z.enum(['CLASS', 'CAMPUS', 'SCHOOL']).optional(),
    status: zod_1.z.string().optional(),
});
//# sourceMappingURL=evaluation-campaigns.schema.js.map