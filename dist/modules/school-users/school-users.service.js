"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolUsersService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma_1 = require("../../core/database/prisma");
const AppError_1 = require("../../core/errors/AppError");
const pagination_1 = require("../../utils/pagination");
const SALT_ROUNDS = 12;
const ASSIGNABLE = [client_1.Role.MANAGER, client_1.Role.AGENT, client_1.Role.VIEWER, client_1.Role.STUDENT];
async function assertCampusAdmin(adminUserId) {
    const admin = await prisma_1.prisma.user.findUnique({ where: { id: adminUserId } });
    if (!admin || ![client_1.Role.ADMIN, client_1.Role.SUPERADMIN].includes(admin.role)) {
        throw new AppError_1.ForbiddenError('Only administrators can manage users');
    }
    return admin;
}
exports.schoolUsersService = {
    async create(adminUserId, input) {
        const admin = await assertCampusAdmin(adminUserId);
        const role = input.role;
        if (!ASSIGNABLE.includes(role)) {
            throw new AppError_1.ForbiddenError('Cannot assign this role');
        }
        const existing = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email: input.email }, ...(input.matricule ? [{ matricule: input.matricule }] : [])],
            },
        });
        if (existing) {
            throw new AppError_1.ConflictError('Email or matricule already in use');
        }
        if (input.classId) {
            const cls = await prisma_1.prisma.class.findFirst({
                where: {
                    id: input.classId,
                    ...(admin.campusId && { campusId: admin.campusId })
                },
            });
            if (!cls)
                throw new AppError_1.BadRequestError('Class does not belong to your scope');
        }
        const passwordHash = await bcrypt_1.default.hash(input.password, SALT_ROUNDS);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: input.email,
                passwordHash,
                firstName: input.firstName,
                lastName: input.lastName,
                role,
                schoolId: admin.schoolId,
                campusId: admin.role === client_1.Role.SUPERADMIN ? (admin.campusId || null) : admin.campusId,
                classId: input.classId ?? null,
                matricule: input.matricule ?? null,
                emailVerified: true,
                emailVerifiedAt: new Date(),
            },
        });
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            campusId: user.campusId,
            classId: user.classId,
            matricule: user.matricule,
            isActive: user.isActive,
        };
    },
    async list(adminUserId, query) {
        const admin = await assertCampusAdmin(adminUserId);
        const pagination = (0, pagination_1.parsePagination)(query);
        const { role, campusId, classId, search, isActive } = query;
        const where = {
            // Data isolation by school
            schoolId: admin.schoolId,
        };
        // Campus filtering
        if (admin.role === client_1.Role.ADMIN) {
            where.campusId = admin.campusId;
        }
        else if (campusId) {
            where.campusId = campusId;
        }
        // Filter by role(s)
        if (role) {
            where.role = role;
        }
        else {
            // Default: don't show SuperAdmins to others
            where.role = { not: client_1.Role.SUPERADMIN };
        }
        // Filter by class
        if (classId) {
            where.classId = classId;
        }
        // Filter by activity
        if (isActive !== undefined) {
            where.isActive = isActive === 'true' || isActive === true;
        }
        // Search by name, email or matricule
        if (search) {
            const s = search;
            where.OR = [
                { email: { contains: s, mode: 'insensitive' } },
                { firstName: { contains: s, mode: 'insensitive' } },
                { lastName: { contains: s, mode: 'insensitive' } },
                { matricule: { contains: s, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    matricule: true,
                    classId: true,
                    campusId: true,
                    createdAt: true,
                },
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async listStaff(adminUserId, query) {
        const admin = await assertCampusAdmin(adminUserId);
        // Personnel management restricted to ADMIN and SUPERADMIN
        if (![client_1.Role.SUPERADMIN, client_1.Role.ADMIN].includes(admin.role)) {
            throw new AppError_1.ForbiddenError('Only administrators can manage the staff');
        }
        return this.list(adminUserId, {
            ...query,
            role: query.role ?? { in: [client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.AGENT, client_1.Role.VIEWER] },
        });
    },
    async listStudents(adminUserId, query) {
        return this.list(adminUserId, {
            ...query,
            role: client_1.Role.STUDENT,
        });
    },
    async update(adminUserId, targetId, input) {
        const admin = await assertCampusAdmin(adminUserId);
        if (targetId === adminUserId) {
            throw new AppError_1.ForbiddenError('Use profile or account settings to change your own account');
        }
        const target = await prisma_1.prisma.user.findUnique({ where: { id: targetId } });
        if (!target)
            throw new AppError_1.NotFoundError('User');
        // Access control
        if (admin.role !== client_1.Role.SUPERADMIN && target.schoolId !== admin.schoolId) {
            throw new AppError_1.ForbiddenError('Access denied: different school');
        }
        if (admin.role === client_1.Role.ADMIN && target.campusId !== admin.campusId) {
            throw new AppError_1.ForbiddenError('Access denied: different campus');
        }
        if (target.role === client_1.Role.SUPERADMIN) {
            throw new AppError_1.ForbiddenError('Cannot modify super administrator');
        }
        if (input.role) {
            const r = input.role;
            if (!ASSIGNABLE.includes(r)) {
                throw new AppError_1.ForbiddenError('Cannot assign this role');
            }
        }
        if (input.classId) {
            const cls = await prisma_1.prisma.class.findFirst({
                where: {
                    id: input.classId,
                    ...(admin.campusId && { campusId: admin.campusId })
                },
            });
            if (!cls)
                throw new AppError_1.BadRequestError('Class does not belong to your scope');
        }
        return prisma_1.prisma.user.update({
            where: { id: targetId },
            data: {
                ...(input.role !== undefined && { role: input.role }),
                ...(input.isActive !== undefined && { isActive: input.isActive }),
                ...(input.classId !== undefined && { classId: input.classId }),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                matricule: true,
                classId: true,
            },
        });
    },
    async getById(adminUserId, targetId) {
        const admin = await assertCampusAdmin(adminUserId);
        const target = await prisma_1.prisma.user.findUnique({ where: { id: targetId } });
        if (!target)
            throw new AppError_1.NotFoundError('User');
        if (admin.role !== client_1.Role.SUPERADMIN && target.schoolId !== admin.schoolId) {
            throw new AppError_1.ForbiddenError('Access denied');
        }
        return target;
    },
    async delete(adminUserId, targetId) {
        const admin = await assertCampusAdmin(adminUserId);
        if (targetId === adminUserId) {
            throw new AppError_1.ForbiddenError('You cannot delete yourself');
        }
        const target = await prisma_1.prisma.user.findUnique({ where: { id: targetId } });
        if (!target)
            throw new AppError_1.NotFoundError('User');
        if (admin.role !== client_1.Role.SUPERADMIN && target.schoolId !== admin.schoolId) {
            throw new AppError_1.ForbiddenError('Access denied: different school');
        }
        if (admin.role === client_1.Role.ADMIN && target.campusId !== admin.campusId) {
            throw new AppError_1.ForbiddenError('Access denied: different campus');
        }
        // Deactivate instead of hard delete to preserve history?
        // User requested "delete", let's follow standard pattern
        return prisma_1.prisma.user.delete({ where: { id: targetId } });
    }
};
//# sourceMappingURL=school-users.service.js.map