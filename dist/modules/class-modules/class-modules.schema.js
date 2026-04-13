"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentQuerySchema = exports.assignmentParamsSchema = exports.updateAssignmentSchema = exports.createAssignmentSchema = void 0;
const zod_1 = require("zod");
exports.createAssignmentSchema = zod_1.z.object({
    classId: zod_1.z.string().uuid(),
    moduleId: zod_1.z.string().uuid(),
    professorIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
});
exports.updateAssignmentSchema = zod_1.z.object({
    professorIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
});
exports.assignmentParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.assignmentQuerySchema = zod_1.z.object({
    classId: zod_1.z.string().uuid().optional(),
    moduleId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=class-modules.schema.js.map