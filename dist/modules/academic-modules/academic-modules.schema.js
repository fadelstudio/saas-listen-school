"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.academicModuleQuerySchema = exports.academicModuleParamsSchema = exports.updateAcademicModuleSchema = exports.createAcademicModuleSchema = void 0;
const zod_1 = require("zod");
exports.createAcademicModuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    code: zod_1.z.string().optional(),
});
exports.updateAcademicModuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    code: zod_1.z.string().optional(),
});
exports.academicModuleParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.academicModuleQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=academic-modules.schema.js.map