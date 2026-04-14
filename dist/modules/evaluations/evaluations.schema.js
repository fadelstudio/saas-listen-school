"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationQuerySchema = exports.evaluationParamsSchema = exports.updateEvaluationSchema = exports.createEvaluationSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const idSchema_1 = require("../../utils/idSchema");
const ratingBandSchema = zod_1.z.nativeEnum(client_1.RatingBand);
const fiveRatings = {
    comprehensionRating: ratingBandSchema,
    explanationRating: ratingBandSchema,
    pedagogyRating: ratingBandSchema,
    availabilityRating: ratingBandSchema,
    rhythmRating: ratingBandSchema,
};
exports.createEvaluationSchema = zod_1.z.object({
    reportId: idSchema_1.idStringSchema.optional(),
    professorId: idSchema_1.idStringSchema,
    moduleId: idSchema_1.idStringSchema,
    classId: idSchema_1.idStringSchema,
    ...fiveRatings,
    comment: zod_1.z.string().max(2000).optional(),
    isAnonymous: zod_1.z.boolean().optional().default(false),
});
exports.updateEvaluationSchema = zod_1.z.object({
    comprehensionRating: ratingBandSchema.optional(),
    explanationRating: ratingBandSchema.optional(),
    pedagogyRating: ratingBandSchema.optional(),
    availabilityRating: ratingBandSchema.optional(),
    rhythmRating: ratingBandSchema.optional(),
    comment: zod_1.z.string().max(2000).optional(),
});
exports.evaluationParamsSchema = zod_1.z.object({
    id: idSchema_1.idStringSchema,
});
exports.evaluationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    status: zod_1.z.nativeEnum(client_1.EvaluationStatus).optional(),
    evaluatorId: idSchema_1.idStringSchema.optional(),
    reportId: idSchema_1.idStringSchema.optional(),
    startDate: zod_1.z.string().datetime({ offset: true }).optional(),
    endDate: zod_1.z.string().datetime({ offset: true }).optional(),
});
//# sourceMappingURL=evaluations.schema.js.map