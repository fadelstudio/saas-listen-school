"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationCampaignQuerySchema = exports.createEvaluationCampaignSchema = exports.evaluationCampaignIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.evaluationCampaignIdParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid campaign id'),
});
exports.createEvaluationCampaignSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
    scope: zod_1.z.enum(['CLASS', 'CAMPUS', 'SCHOOL']).default('CLASS'),
    classId: zod_1.z.string().uuid().optional(),
    campusId: zod_1.z.string().uuid().optional(),
    moduleId: zod_1.z.string().uuid(),
    professorId: zod_1.z.string().uuid(),
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
    classId: zod_1.z.string().uuid().optional(),
    campusId: zod_1.z.string().uuid().optional(),
    scope: zod_1.z.enum(['CLASS', 'CAMPUS', 'SCHOOL']).optional(),
    status: zod_1.z.string().optional(),
});
//# sourceMappingURL=evaluation-campaigns.schema.js.map