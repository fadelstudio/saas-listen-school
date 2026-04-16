"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolUserQuerySchema = exports.schoolUserParamsSchema = exports.updateSchoolUserSchema = exports.createSchoolUserSchema = void 0;
const zod_1 = require("zod");
const idSchema_1 = require("../../utils/idSchema");
exports.createSchoolUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    firstName: zod_1.z.string().min(1).max(50),
    lastName: zod_1.z.string().min(1).max(50),
    role: zod_1.z.enum(['MANAGER', 'AGENT', 'VIEWER', 'STUDENT']),
    matricule: zod_1.z.string().min(1).max(50).optional(),
    classId: idSchema_1.idStringSchema.optional(),
});
exports.updateSchoolUserSchema = zod_1.z.object({
    role: zod_1.z.enum(['MANAGER', 'AGENT', 'VIEWER', 'STUDENT']).optional(),
    isActive: zod_1.z.boolean().optional(),
    classId: zod_1.z.union([idSchema_1.idStringSchema, zod_1.z.null()]).optional(),
});
exports.schoolUserParamsSchema = zod_1.z.object({
    id: idSchema_1.idStringSchema,
});
exports.schoolUserQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'AGENT', 'VIEWER', 'STUDENT']).optional(),
    campusId: idSchema_1.idStringSchema.optional(),
    classId: idSchema_1.idStringSchema.optional(),
    search: zod_1.z.string().optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
});
//# sourceMappingURL=school-users.schema.js.map