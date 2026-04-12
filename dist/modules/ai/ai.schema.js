"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiJobQuerySchema = exports.aiJobParamsSchema = exports.synthesisSchema = exports.chatSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.chatSchema = zod_1.z.object({
    question: zod_1.z.string().min(3, 'Question must be at least 3 characters').max(1000),
});
exports.synthesisSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime({ offset: true }).optional(),
    endDate: zod_1.z.string().datetime({ offset: true }).optional(),
});
exports.aiJobParamsSchema = zod_1.z.object({
    jobId: zod_1.z.string().uuid('Invalid job ID'),
});
exports.aiJobQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    status: zod_1.z.nativeEnum(client_1.AiJobStatus).optional(),
    jobType: zod_1.z.string().optional(),
    reportId: zod_1.z.string().uuid().optional(),
    evaluationId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=ai.schema.js.map