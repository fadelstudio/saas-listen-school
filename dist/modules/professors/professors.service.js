"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professorsService = void 0;
const client_1 = require("@prisma/client");
const professors_repository_1 = require("./professors.repository");
const pagination_1 = require("../../utils/pagination");
const AppError_1 = require("../../core/errors/AppError");
const prisma_1 = require("../../core/database/prisma");
const uploads_service_1 = require("../uploads/uploads.service");
function optionalProfileString(v) {
    if (v === undefined)
        return undefined;
    if (v === null)
        return null;
    const t = v.trim();
    return t === '' ? null : t;
}
function enrichProfessor(row) {
    const campusAccess = row.campusId == null ? 'ALL' : 'RESTRICTED';
    return {
        ...row,
        campusAccess,
        /** Libellé UI : tous les campus de l’école si aucun campus assigné */
        campusScopeLabel: row.campusId == null ? 'TOUS' : null,
    };
}
async function enrichProfessorWithAvatar(p) {
    const storagePath = p.user?.avatarPath ?? p.avatarPath ?? null;
    const avatarUrl = await uploads_service_1.uploadsService.getSignedUrlForPath(storagePath);
    const { user, avatarPath: _a, ...rest } = p;
    return {
        ...enrichProfessor(rest),
        avatarUrl,
        linkedUserId: user?.id ?? null,
    };
}
exports.professorsService = {
    async getAll(schoolId, query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            campusId: query.campusId,
            search: query.search,
        };
        const { items, total } = await professors_repository_1.professorsRepository.findAll(schoolId, filters, pagination);
        const enriched = await Promise.all(items.map((p) => enrichProfessorWithAvatar(p)));
        return (0, pagination_1.buildPaginated)(enriched, total, pagination.page, pagination.limit);
    },
    async getById(id, schoolId) {
        const professor = await professors_repository_1.professorsRepository.findById(id, schoolId);
        if (!professor)
            throw new AppError_1.NotFoundError('Professor');
        return enrichProfessorWithAvatar(professor);
    },
    async create(schoolId, data) {
        const raw = data.campusId;
        const campusId = raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')
            ? null
            : raw;
        if (campusId) {
            const campus = await prisma_1.prisma.campus.findFirst({ where: { id: campusId, schoolId } });
            if (!campus)
                throw new AppError_1.BadRequestError('Campus does not belong to this school');
        }
        const created = await professors_repository_1.professorsRepository.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            userId: data.userId,
            campusId,
            matricule: optionalProfileString(data.matricule) ?? null,
            numero: optionalProfileString(data.numero) ?? null,
            phone: optionalProfileString(data.phone) ?? null,
        });
        return enrichProfessorWithAvatar(created);
    },
    async update(id, schoolId, data) {
        let campusId = data.campusId;
        if (campusId === '')
            campusId = null;
        if (campusId) {
            const campus = await prisma_1.prisma.campus.findFirst({ where: { id: campusId, schoolId } });
            if (!campus)
                throw new AppError_1.BadRequestError('Campus does not belong to this school');
        }
        const patch = {
            ...data,
            campusId,
            ...(data.matricule !== undefined && {
                matricule: optionalProfileString(data.matricule) ?? null,
            }),
            ...(data.numero !== undefined && {
                numero: optionalProfileString(data.numero) ?? null,
            }),
            ...(data.phone !== undefined && {
                phone: optionalProfileString(data.phone) ?? null,
            }),
        };
        const updated = await professors_repository_1.professorsRepository.update(id, schoolId, patch);
        if (!updated)
            throw new AppError_1.NotFoundError('Professor');
        return enrichProfessorWithAvatar(updated);
    },
    async delete(id, schoolId) {
        const ok = await professors_repository_1.professorsRepository.delete(id, schoolId);
        if (!ok)
            throw new AppError_1.NotFoundError('Professor');
    },
    async uploadAvatar(schoolId, professorId, file, requester) {
        const professor = await professors_repository_1.professorsRepository.findById(professorId, schoolId);
        if (!professor)
            throw new AppError_1.NotFoundError('Professor');
        const isStaff = requester.role === client_1.Role.ADMIN || requester.role === client_1.Role.MANAGER;
        const isSelfLinked = professor.userId === requester.userId;
        if (!isStaff && !isSelfLinked) {
            throw new AppError_1.ForbiddenError('Not allowed to update this professor profile photo');
        }
        const { path } = await uploads_service_1.uploadsService.uploadProfileImage(file, `avatars/professors/${professorId}`);
        const oldUserPath = professor.user?.avatarPath;
        const oldProfPath = professor.avatarPath;
        if (professor.userId) {
            if (oldUserPath && oldUserPath !== path) {
                await uploads_service_1.uploadsService.removeObjectAtPath(oldUserPath).catch(() => { });
            }
            if (oldProfPath) {
                await uploads_service_1.uploadsService.removeObjectAtPath(oldProfPath).catch(() => { });
            }
            await prisma_1.prisma.user.update({ where: { id: professor.userId }, data: { avatarPath: path } });
            await prisma_1.prisma.professor.update({ where: { id: professorId }, data: { avatarPath: null } });
        }
        else {
            if (oldProfPath && oldProfPath !== path) {
                await uploads_service_1.uploadsService.removeObjectAtPath(oldProfPath).catch(() => { });
            }
            await prisma_1.prisma.professor.update({ where: { id: professorId }, data: { avatarPath: path } });
        }
        const updated = await professors_repository_1.professorsRepository.findById(professorId, schoolId);
        return enrichProfessorWithAvatar(updated);
    },
    async clearAvatar(schoolId, professorId, requester) {
        const professor = await professors_repository_1.professorsRepository.findById(professorId, schoolId);
        if (!professor)
            throw new AppError_1.NotFoundError('Professor');
        const isStaff = requester.role === client_1.Role.ADMIN || requester.role === client_1.Role.MANAGER;
        const isSelfLinked = professor.userId === requester.userId;
        if (!isStaff && !isSelfLinked) {
            throw new AppError_1.ForbiddenError('Not allowed to update this professor profile photo');
        }
        if (professor.userId) {
            const linkedPath = professor.user?.avatarPath;
            if (linkedPath) {
                await uploads_service_1.uploadsService.removeObjectAtPath(linkedPath).catch(() => { });
            }
            await prisma_1.prisma.user.update({ where: { id: professor.userId }, data: { avatarPath: null } });
        }
        if (professor.avatarPath) {
            await uploads_service_1.uploadsService.removeObjectAtPath(professor.avatarPath).catch(() => { });
            await prisma_1.prisma.professor.update({ where: { id: professorId }, data: { avatarPath: null } });
        }
        const updated = await professors_repository_1.professorsRepository.findById(professorId, schoolId);
        return enrichProfessorWithAvatar(updated);
    },
};
//# sourceMappingURL=professors.service.js.map