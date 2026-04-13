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
    classId: zod_1.z.string().uuid(),
    moduleId: zod_1.z.string().uuid(),
    professorId: zod_1.z.string().uuid(),
    dueDate: zod_1.z.string().datetime({ offset: true }).optional(),
});
exports.evaluationCampaignQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    classId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.string().optional(),
});
//# sourceMappingURL=evaluation-campaigns.schema.js.map