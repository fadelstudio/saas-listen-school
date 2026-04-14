"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentQuerySchema = exports.assignmentParamsSchema = exports.updateAssignmentSchema = exports.createAssignmentSchema = void 0;
const zod_1 = require("zod");
const idSchema_1 = require("../../utils/idSchema");
exports.createAssignmentSchema = zod_1.z.object({
    classId: idSchema_1.idStringSchema,
    moduleId: idSchema_1.idStringSchema,
    professorIds: zod_1.z.array(idSchema_1.idStringSchema).optional(),
});
exports.updateAssignmentSchema = zod_1.z.object({
    professorIds: zod_1.z.array(idSchema_1.idStringSchema).optional(),
});
exports.assignmentParamsSchema = zod_1.z.object({
    id: idSchema_1.idStringSchema,
});
exports.assignmentQuerySchema = zod_1.z.object({
    classId: idSchema_1.idStringSchema.optional(),
    moduleId: idSchema_1.idStringSchema.optional(),
});
//# sourceMappingURL=class-modules.schema.js.map