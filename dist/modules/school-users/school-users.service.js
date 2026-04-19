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
const env_1 = require("../../core/config/env");
const uploads_service_1 = require("../uploads/uploads.service");
const SALT_ROUNDS = 12;
const ASSIGNABLE = [client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.AGENT, client_1.Role.VIEWER, client_1.Role.STUDENT];
function enrichSchoolUser(row) {
    const isGlobal = !row.campuses || row.campuses.length === 0;
    return {
        ...row,
        campusAccess: isGlobal ? 'ALL' : 'RESTRICTED',
        campusScopeLabel: isGlobal ? 'TOUS' : null,
    };
}
async function enrichSchoolUserWithAvatar(row) {
    const base = enrichSchoolUser(row);
    const avatarUrl = await uploads_service_1.uploadsService.getSignedUrlForPath(row.avatarPath ?? null);
    return { ...base, avatarUrl };
}
/** Affectation campus : classe > campus explicite > null (= tous les campus de l’école). */
async function resolveCampusesForUser(admin, input, role) {
    if (role === client_1.Role.ADMIN || role === client_1.Role.SUPERADMIN)
        return [];
    const schoolId = admin.schoolId;
    if (input.classId) {
        const cls = await prisma_1.prisma.class.findFirst({
            where: {
                id: input.classId,
                campus: { schoolId },
                // Restreindre au scope de l'admin si non global
                ...(admin.campuses.length > 0 ? { campusId: { in: admin.campuses.map(c => c.id) } } : {}),
            },
        });
        if (!cls)
            throw new AppError_1.BadRequestError('Class does not belong to your scope');
        return [cls.campusId];
    }
    if (input.campusIds && input.campusIds.length > 0) {
        const count = await prisma_1.prisma.campus.count({
            where: {
                id: { in: input.campusIds },
                schoolId,
                // Restreindre au scope de l'admin si non global
                ...(admin.campuses.length > 0 ? { id: { in: admin.campuses.map(c => c.id) } } : {}),
            },
        });
        if (count !== input.campusIds.length) {
            throw new AppError_1.BadRequestError('One or more campuses are invalid or out of scope');
        }
        return input.campusIds;
    }
    return [];
}
async function assertCampusAdmin(adminUserId) {
    const admin = await prisma_1.prisma.user.findUnique({
        where: { id: adminUserId },
        include: { campuses: { select: { id: true } } }
    });
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
        if (role === client_1.Role.STUDENT && !input.classId) {
            throw new AppError_1.BadRequestError('Students must be assigned to a class');
        }
        const existing = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email: input.email }, ...(input.matricule ? [{ matricule: input.matricule }] : [])],
            },
        });
        if (existing) {
            throw new AppError_1.ConflictError('Email or matricule already in use');
        }
        const resolvedCampusIds = await resolveCampusesForUser(admin, {
            campusIds: input.campusIds,
            classId: input.classId,
        }, role);
        const passwordHash = await bcrypt_1.default.hash(input.password, SALT_ROUNDS);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: input.email,
                passwordHash,
                firstName: input.firstName,
                lastName: input.lastName,
                role,
                schoolId: admin.schoolId,
                campuses: { connect: resolvedCampusIds.map(id => ({ id })) },
                classId: input.classId ?? null,
                matricule: input.matricule ?? null,
                numero: input.numero?.trim() || null,
                phone: input.phone?.trim() || null,
                emailVerified: true,
                emailVerifiedAt: new Date(),
            },
            include: { campuses: { select: { id: true } } },
        });
        return enrichSchoolUserWithAvatar({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            campuses: user.campuses,
            classId: user.classId,
            matricule: user.matricule,
            numero: user.numero,
            phone: user.phone,
            avatarPath: user.avatarPath,
            isActive: user.isActive,
        });
    },
    async list(adminUserId, query) {
        const admin = await assertCampusAdmin(adminUserId);
        const pagination = (0, pagination_1.parsePagination)(query);
        const { role, campusId, classId, search, isActive } = query;
        const where = {
            // Data isolation by school
            schoolId: admin.schoolId,
        };
        // Campus filtering : ADMIN sans campus = toute l’école ; sinon scope campus
        if (admin.role === client_1.Role.ADMIN) {
            if (admin.campuses.length > 0) {
                where.campuses = { some: { id: { in: admin.campuses.map(c => c.id) } } };
            }
        }
        else if (campusId) {
            where.campuses = { some: { id: campusId } };
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
                { numero: { contains: s, mode: 'insensitive' } },
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
                    numero: true,
                    phone: true,
                    classId: true,
                    campuses: { select: { id: true } },
                    avatarPath: true,
                    createdAt: true,
                },
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        const enriched = await Promise.all(items.map((u) => enrichSchoolUserWithAvatar(u)));
        return (0, pagination_1.buildPaginated)(enriched, total, pagination.page, pagination.limit);
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
        const target = await prisma_1.prisma.user.findUnique({ where: { id: targetId } });
        if (!target)
            throw new AppError_1.NotFoundError('User');
        if (targetId === adminUserId && input.role && input.role !== target.role) {
            throw new AppError_1.ForbiddenError('You cannot change your own role');
        }
        if (targetId === adminUserId && input.isActive !== undefined && input.isActive !== target.isActive) {
            throw new AppError_1.ForbiddenError('You cannot deactivate yourself');
        }
        // Access control
        if (admin.role !== client_1.Role.SUPERADMIN && target.schoolId !== admin.schoolId) {
            throw new AppError_1.ForbiddenError('Access denied: different school');
        }
        if (admin.role === client_1.Role.ADMIN && admin.campuses.length > 0) {
            const hasCommon = await prisma_1.prisma.user.findFirst({
                where: {
                    id: targetId,
                    campuses: { some: { id: { in: admin.campuses.map(c => c.id) } } }
                }
            });
            if (!hasCommon)
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
        let resolvedCampusIds = input.campusIds;
        if (input.classId) {
            const cls = await prisma_1.prisma.class.findFirst({
                where: {
                    id: input.classId,
                    campus: { schoolId: admin.schoolId },
                    ...(admin.campuses.length > 0 ? { campusId: { in: admin.campuses.map(c => c.id) } } : {}),
                },
            });
            if (!cls)
                throw new AppError_1.BadRequestError('Class does not belong to your scope');
            resolvedCampusIds = [cls.campusId];
        }
        return prisma_1.prisma.user.update({
            where: { id: targetId },
            data: {
                ...(input.role !== undefined && { role: input.role }),
                ...(input.isActive !== undefined && { isActive: input.isActive }),
                ...(input.classId !== undefined && { classId: input.classId }),
                ...(resolvedCampusIds !== undefined && { campuses: { set: resolvedCampusIds.map(id => ({ id })) } }),
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
                campuses: { select: { id: true } },
            },
        });
    },
    async getById(adminUserId, targetId) {
        const admin = await assertCampusAdmin(adminUserId);
        const target = await prisma_1.prisma.user.findUnique({
            where: { id: targetId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                matricule: true,
                numero: true,
                phone: true,
                classId: true,
                campuses: { select: { id: true } },
                schoolId: true,
                avatarPath: true,
                createdAt: true,
                updatedAt: true,
                emailVerified: true,
            },
        });
        if (!target)
            throw new AppError_1.NotFoundError('User');
        if (admin.role !== client_1.Role.SUPERADMIN && target.schoolId !== admin.schoolId) {
            throw new AppError_1.ForbiddenError('Access denied');
        }
        return enrichSchoolUserWithAvatar(target);
    },
    async resetPasswordToDefault(adminUserId, targetId) {
        const admin = await assertCampusAdmin(adminUserId);
        if (targetId === adminUserId) {
            throw new AppError_1.ForbiddenError('Use change-password to update your own password');
        }
        const target = await prisma_1.prisma.user.findUnique({ where: { id: targetId } });
        if (!target)
            throw new AppError_1.NotFoundError('User');
        if (admin.role !== client_1.Role.SUPERADMIN && target.schoolId !== admin.schoolId) {
            throw new AppError_1.ForbiddenError('Access denied: different school');
        }
        if (admin.role === client_1.Role.ADMIN && admin.campuses.length > 0) {
            const hasCommon = await prisma_1.prisma.user.findFirst({
                where: {
                    id: targetId,
                    campuses: { some: { id: { in: admin.campuses.map(c => c.id) } } }
                }
            });
            if (!hasCommon)
                throw new AppError_1.ForbiddenError('Access denied: different campus');
        }
        if (target.role === client_1.Role.SUPERADMIN) {
            throw new AppError_1.ForbiddenError('Cannot reset super administrator password');
        }
        const passwordHash = await bcrypt_1.default.hash(env_1.env.DEFAULT_PASSWORD_RESET, SALT_ROUNDS);
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.user.update({
                where: { id: targetId },
                data: { passwordHash },
            }),
            prisma_1.prisma.refreshToken.deleteMany({ where: { userId: targetId } }),
            prisma_1.prisma.passwordResetToken.deleteMany({ where: { userId: targetId } }),
            prisma_1.prisma.loginOtpChallenge.deleteMany({ where: { userId: targetId } }),
        ]);
        return {
            message: 'Password reset. The user must sign in with the default password configured for the server (DEFAULT_PASSWORD_RESET).',
        };
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
        if (admin.role === client_1.Role.ADMIN && admin.campuses.length > 0) {
            const hasCommon = await prisma_1.prisma.user.findFirst({
                where: {
                    id: targetId,
                    campuses: { some: { id: { in: admin.campuses.map(c => c.id) } } }
                }
            });
            if (!hasCommon)
                throw new AppError_1.ForbiddenError('Access denied: different campus');
        }
        // Deactivate instead of hard delete to preserve history?
        // User requested "delete", let's follow standard pattern
        return prisma_1.prisma.user.delete({ where: { id: targetId } });
    }
};
//# sourceMappingURL=school-users.service.js.map