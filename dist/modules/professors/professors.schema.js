"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professorQuerySchema = exports.professorParamsSchema = exports.updateProfessorSchema = exports.createProfessorSchema = void 0;
const zod_1 = require("zod");
exports.createProfessorSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(100),
    lastName: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    userId: zod_1.z.string().uuid().optional(),
});
exports.updateProfessorSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(100).optional(),
    lastName: zod_1.z.string().min(2).max(100).optional(),
    email: zod_1.z.string().email().optional(),
    userId: zod_1.z.string().uuid().optional(),
});
exports.professorParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.professorQuerySchema = zod_1.z.object({
    campusId: zod_1.z.string().uuid().optional(),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=professors.schema.js.map