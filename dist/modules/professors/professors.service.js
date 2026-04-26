"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.professorsService = void 0;
/// <reference types="multer" />
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = require("../../core/config/env");
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
    return {
        ...row,
        campusAccess: 'ALL',
        campusScopeLabel: 'TOUS',
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
        let userId = data.userId;
        if (!userId) {
            // Chercher un User existant avec cet email dans la même école uniquement
            const existingUser = await prisma_1.prisma.user.findFirst({
                where: { email: data.email, schoolId },
            });
            if (existingUser) {
                // Vérifier qu'il n'est pas déjà lié à un professor
                const alreadyLinked = await prisma_1.prisma.professor.findFirst({
                    where: { userId: existingUser.id },
                });
                if (alreadyLinked) {
                    throw new AppError_1.ConflictError('This user already has a professor profile');
                }
                userId = existingUser.id;
            }
            else {
                // Vérifier qu'un professeur avec cet email n'existe pas déjà (global — email unique)
                const emailTaken = await prisma_1.prisma.professor.findUnique({ where: { email: data.email } });
                if (emailTaken) {
                    throw new AppError_1.ConflictError('A professor with this email already exists');
                }
                const password = data.password || env_1.env.DEFAULT_PASSWORD_RESET;
                const passwordHash = await bcrypt_1.default.hash(password, 12);
                const newUser = await prisma_1.prisma.user.create({
                    data: {
                        email: data.email,
                        passwordHash,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        role: client_1.Role.PROFESSOR,
                        schoolId,
                        emailVerified: true,
                        emailVerifiedAt: new Date(),
                    },
                });
                userId = newUser.id;
            }
        }
        const created = await professors_repository_1.professorsRepository.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            userId,
            schoolId,
            matricule: optionalProfileString(data.matricule) ?? null,
            numero: optionalProfileString(data.numero) ?? null,
            phone: optionalProfileString(data.phone) ?? null,
        });
        return enrichProfessorWithAvatar(created);
    },
    async update(id, schoolId, data) {
        const patch = {
            ...data,
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