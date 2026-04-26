"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalAnalysisSchema = void 0;
const zod_1 = require("zod");
exports.globalAnalysisSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200),
    campusId: zod_1.z.string().uuid().optional(),
    classId: zod_1.z.string().uuid().optional(),
    professorId: zod_1.z.string().uuid().optional(),
    moduleId: zod_1.z.string().uuid().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    includeReports: zod_1.z.boolean().default(true),
    includeEvaluations: zod_1.z.boolean().default(true),
    periodic: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=analytics.schema.js.map