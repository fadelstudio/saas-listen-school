"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolUserQuerySchema = exports.schoolUserParamsSchema = exports.updateSchoolUserSchema = exports.createSchoolUserSchema = void 0;
const zod_1 = require("zod");
const idSchema_1 = require("../../utils/idSchema");
/** Chaîne vide / null → ignoré (ex. campus vide = tous les campus pour le staff). */
const optionalId = zod_1.z.preprocess((v) => (v === '' || v === null ? undefined : v), idSchema_1.idStringSchema.optional());
exports.createSchoolUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    firstName: zod_1.z.string().min(1).max(50),
    lastName: zod_1.z.string().min(1).max(50),
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'AGENT', 'VIEWER', 'STUDENT', 'PROFESSOR']),
    matricule: zod_1.z.string().min(1).max(50).optional(),
    numero: zod_1.z.string().max(120).optional(),
    phone: zod_1.z.string().max(40).optional(),
    bio: zod_1.z.string().max(1000).optional(),
    address: zod_1.z.string().max(255).optional(),
    /**
     * Optionnel. Pour MANAGER / AGENT / VIEWER : si omis ou vide → `campusId` null
     * (périmètre toute l’école, comme un admin école sans campus).
     * Pour STUDENT : utiliser `classId` (le campus est déduit de la classe).
     */
    campusIds: zod_1.z.array(idSchema_1.idStringSchema).optional(),
    classId: optionalId,
});
exports.updateSchoolUserSchema = zod_1.z.object({
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'AGENT', 'VIEWER', 'STUDENT', 'PROFESSOR']).optional(),
    isActive: zod_1.z.boolean().optional(),
    classId: zod_1.z.union([idSchema_1.idStringSchema, zod_1.z.null()]).optional(),
    campusIds: zod_1.z.array(idSchema_1.idStringSchema).optional(),
    firstName: zod_1.z.string().min(1).max(50).optional(),
    lastName: zod_1.z.string().min(1).max(50).optional(),
    matricule: zod_1.z.union([zod_1.z.string().max(50), zod_1.z.literal(''), zod_1.z.null()]).optional(),
    numero: zod_1.z.union([zod_1.z.string().max(120), zod_1.z.literal(''), zod_1.z.null()]).optional(),
    phone: zod_1.z.union([zod_1.z.string().max(40), zod_1.z.literal(''), zod_1.z.null()]).optional(),
    bio: zod_1.z.union([zod_1.z.string().max(1000), zod_1.z.literal(''), zod_1.z.null()]).optional(),
    address: zod_1.z.union([zod_1.z.string().max(255), zod_1.z.literal(''), zod_1.z.null()]).optional(),
});
exports.schoolUserParamsSchema = zod_1.z.object({
    id: idSchema_1.idStringSchema,
});
exports.schoolUserQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'AGENT', 'VIEWER', 'STUDENT', 'PROFESSOR']).optional(),
    campusId: optionalId,
    classId: optionalId,
    search: zod_1.z.string().optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
});
//# sourceMappingURL=school-users.schema.js.map