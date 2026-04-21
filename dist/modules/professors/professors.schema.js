"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professorQuerySchema = exports.professorParamsSchema = exports.updateProfessorSchema = exports.createProfessorSchema = void 0;
const zod_1 = require("zod");
const profileFields = {
    matricule: zod_1.z.union([zod_1.z.string().max(120), zod_1.z.literal(''), zod_1.z.null()]).optional(),
    numero: zod_1.z.union([zod_1.z.string().max(120), zod_1.z.literal(''), zod_1.z.null()]).optional(),
    phone: zod_1.z.union([zod_1.z.string().max(40), zod_1.z.literal(''), zod_1.z.null()]).optional(),
};
exports.createProfessorSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(100),
    lastName: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    userId: zod_1.z.string().uuid().optional(),
    password: zod_1.z.string().min(8).optional(),
    ...profileFields,
});
exports.updateProfessorSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(100).optional(),
    lastName: zod_1.z.string().min(2).max(100).optional(),
    email: zod_1.z.string().email().optional(),
    userId: zod_1.z.string().uuid().optional(),
    ...profileFields,
});
exports.professorParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.professorQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=professors.schema.js.map