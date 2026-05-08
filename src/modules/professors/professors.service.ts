/// <reference types="multer" />
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../../core/config/env';
import { professorsRepository } from './professors.repository';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError, ForbiddenError, ConflictError } from '../../core/errors/AppError';
import { ProfessorFilters } from './professors.types';
import { prisma } from '../../core/database/prisma';
import { uploadsService } from '../uploads/uploads.service';
import { auditService } from '../audit/audit.service';

function optionalProfileString(v: string | null | undefined): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const t = v.trim();
  return t === '' ? null : t;
}

function enrichProfessor<T>(row: T) {
  return {
    ...row,
    campusAccess: 'ALL' as const,
    campusScopeLabel: 'TOUS' as const,
  };
}

type ProfessorRow = {
  avatarPath: string | null;
  user: { id: string; avatarPath: string | null } | null;
  [key: string]: unknown;
};

async function enrichProfessorWithAvatar(p: ProfessorRow) {
  const storagePath = p.user?.avatarPath ?? p.avatarPath ?? null;
  const avatarUrl = await uploadsService.getSignedUrlForPath(storagePath);
  const { user, avatarPath: _a, ...rest } = p;
  return {
    ...enrichProfessor(rest),
    avatarUrl,
    linkedUserId: user?.id ?? null,
  };
}

export const professorsService = {
  async getAll(schoolId: string, query: Record<string, unknown>, userRole?: string, userCampusIds?: string[]) {
    const pagination = parsePagination(query);
    const filters: ProfessorFilters = {
      search: query.search as string | undefined,
      classId: query.classId as string | undefined,
      campusId: query.campusId as string | undefined,
    };
    if (['ADMIN', 'MANAGER', 'AGENT', 'VIEWER'].includes(userRole || '') && userCampusIds && userCampusIds.length > 0) {
      if (filters.campusId && !userCampusIds.includes(filters.campusId)) {
        throw new ForbiddenError('Requested campus is outside your scope');
      }
      if (!filters.campusId) filters.campusIds = userCampusIds;
    }


    const { items, total } = await professorsRepository.findAll(schoolId, filters, pagination);
    const enriched = await Promise.all(items.map((p) => enrichProfessorWithAvatar(p as ProfessorRow)));
    return buildPaginated(enriched, total, pagination.page, pagination.limit);
  },

  async getById(id: string, schoolId: string, userRole?: string, userCampusIds?: string[]) {
    const professor = await professorsRepository.findById(id, schoolId);
    if (!professor) throw new NotFoundError('Professor');
    if (
      ['ADMIN', 'MANAGER', 'AGENT', 'VIEWER'].includes(userRole || '') &&
      userCampusIds &&
      userCampusIds.length > 0 &&
      professor.evaluations.length > 0
    ) {
      const hasScopedEval = professor.evaluations.some((e) => e.class?.campusId && userCampusIds.includes(e.class.campusId));
      if (!hasScopedEval) throw new NotFoundError('Professor');
    }
    return enrichProfessorWithAvatar(professor as ProfessorRow);
  },

  async create(
    schoolId: string,
    data: {
      firstName: string;
      lastName: string;
      email: string;
      userId?: string;
      password?: string;
      matricule?: string | null;
      numero?: string | null;
      phone?: string | null;
    },
    userRole?: string,
    _userCampusIds?: string[],
    requesterId?: string
  ) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');
    let userId = data.userId;

    if (!userId) {
      // Chercher un User existant avec cet email dans la même école uniquement
      const existingUser = await prisma.user.findFirst({
        where: { email: data.email, schoolId },
      });

      if (existingUser) {
        // Vérifier qu'il n'est pas déjà lié à un professor
        const alreadyLinked = await prisma.professor.findFirst({
          where: { userId: existingUser.id },
        });
        if (alreadyLinked) {
          throw new ConflictError('This user already has a professor profile');
        }
        userId = existingUser.id;
      } else {
        // Vérifier qu'un professeur avec cet email n'existe pas déjà (global — email unique)
        const emailTaken = await prisma.professor.findUnique({ where: { email: data.email } });
        if (emailTaken) {
          throw new ConflictError('A professor with this email already exists');
        }

        const password = data.password || env.DEFAULT_PASSWORD_RESET;
        const passwordHash = await bcrypt.hash(password, 12);
        const newUser = await prisma.user.create({
          data: {
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            role: (Role as any).PROFESSOR,
            schoolId,
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        });
        userId = newUser.id;
      }
    }

    const created = await professorsRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      userId,
      schoolId,
      matricule: optionalProfileString(data.matricule as string | null | undefined) ?? null,
      numero: optionalProfileString(data.numero as string | null | undefined) ?? null,
      phone: optionalProfileString(data.phone as string | null | undefined) ?? null,
    });

    await auditService.log({
      schoolId,
      userId: requesterId,
      action: 'CREATE_PROFESSOR',
      entity: 'Professor',
      entityId: created.id,
      details: { firstName: created.firstName, lastName: created.lastName, email: created.email }
    });

    return enrichProfessorWithAvatar(created as ProfessorRow);
  },

  async update(
    id: string,
    schoolId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      userId?: string;
      matricule?: string | null;
      numero?: string | null;
      phone?: string | null;
    },
    userRole?: string,
    userCampusIds?: string[],
    requesterId?: string
  ) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');

    // Scoping check
    await this.getById(id, schoolId, userRole, userCampusIds);

    const patch = {
      ...data,
      ...(data.matricule !== undefined && {
        matricule: optionalProfileString(data.matricule as string | null | undefined) ?? null,
      }),
      ...(data.numero !== undefined && {
        numero: optionalProfileString(data.numero as string | null | undefined) ?? null,
      }),
      ...(data.phone !== undefined && {
        phone: optionalProfileString(data.phone as string | null | undefined) ?? null,
      }),
    };
    const updated = await professorsRepository.update(id, schoolId, patch);
    if (!updated) throw new NotFoundError('Professor');

    await auditService.log({
      schoolId,
      userId: requesterId,
      action: 'UPDATE_PROFESSOR',
      entity: 'Professor',
      entityId: id,
      details: { updatedFields: Object.keys(data) }
    });

    return enrichProfessorWithAvatar(updated as ProfessorRow);
  },

  async delete(id: string, schoolId: string, userRole?: string, userCampusIds?: string[], requesterId?: string) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');
    
    // Scoping check
    await this.getById(id, schoolId, userRole, userCampusIds);

    const ok = await professorsRepository.delete(id, schoolId);
    if (!ok) throw new NotFoundError('Professor');

    await auditService.log({
      schoolId,
      userId: requesterId,
      action: 'DELETE_PROFESSOR',
      entity: 'Professor',
      entityId: id,
    });
  },

  async uploadAvatar(
    schoolId: string,
    professorId: string,
    file: Express.Multer.File,
    requester: { userId: string; role: Role },
  ) {
    const professor = await professorsRepository.findById(professorId, schoolId);
    if (!professor) throw new NotFoundError('Professor');
    const isStaff = requester.role === Role.ADMIN || requester.role === Role.MANAGER || requester.role === Role.AGENT;
    if (requester.role === Role.VIEWER) throw new ForbiddenError('VIEWER role is read-only');
    const isSelfLinked = professor.userId === requester.userId;
    if (!isStaff && !isSelfLinked) {
      throw new ForbiddenError('Not allowed to update this professor profile photo');
    }

    const { path } = await uploadsService.uploadProfileImage(file, `avatars/professors/${professorId}`);
    const oldUserPath = professor.user?.avatarPath;
    const oldProfPath = professor.avatarPath;

    if (professor.userId) {
      if (oldUserPath && oldUserPath !== path) {
        await uploadsService.removeObjectAtPath(oldUserPath).catch(() => {});
      }
      if (oldProfPath) {
        await uploadsService.removeObjectAtPath(oldProfPath).catch(() => {});
      }
      await prisma.user.update({ where: { id: professor.userId }, data: { avatarPath: path } });
      await prisma.professor.update({ where: { id: professorId }, data: { avatarPath: null } });
    } else {
      if (oldProfPath && oldProfPath !== path) {
        await uploadsService.removeObjectAtPath(oldProfPath).catch(() => {});
      }
      await prisma.professor.update({ where: { id: professorId }, data: { avatarPath: path } });
    }

    const updated = await professorsRepository.findById(professorId, schoolId);
    return enrichProfessorWithAvatar(updated as ProfessorRow);
  },

  async clearAvatar(
    schoolId: string,
    professorId: string,
    requester: { userId: string; role: Role },
  ) {
    const professor = await professorsRepository.findById(professorId, schoolId);
    if (!professor) throw new NotFoundError('Professor');
    const isStaff = requester.role === Role.ADMIN || requester.role === Role.MANAGER || requester.role === Role.AGENT;
    if (requester.role === Role.VIEWER) throw new ForbiddenError('VIEWER role is read-only');
    const isSelfLinked = professor.userId === requester.userId;
    if (!isStaff && !isSelfLinked) {
      throw new ForbiddenError('Not allowed to update this professor profile photo');
    }

    if (professor.userId) {
      const linkedPath = professor.user?.avatarPath;
      if (linkedPath) {
        await uploadsService.removeObjectAtPath(linkedPath).catch(() => {});
      }
      await prisma.user.update({ where: { id: professor.userId }, data: { avatarPath: null } });
    }
    if (professor.avatarPath) {
      await uploadsService.removeObjectAtPath(professor.avatarPath).catch(() => {});
      await prisma.professor.update({ where: { id: professorId }, data: { avatarPath: null } });
    }

    const updated = await professorsRepository.findById(professorId, schoolId);
    return enrichProfessorWithAvatar(updated as ProfessorRow);
  },
};
