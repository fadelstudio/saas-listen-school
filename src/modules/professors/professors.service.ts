import { Role } from '@prisma/client';
import { professorsRepository } from './professors.repository';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../core/errors/AppError';
import { ProfessorFilters } from './professors.types';
import { prisma } from '../../core/database/prisma';
import { uploadsService } from '../uploads/uploads.service';

function optionalProfileString(v: string | null | undefined): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const t = v.trim();
  return t === '' ? null : t;
}

function enrichProfessor<T extends { campusId: string | null }>(row: T) {
  const campusAccess = row.campusId == null ? ('ALL' as const) : ('RESTRICTED' as const);
  return {
    ...row,
    campusAccess,
    /** Libellé UI : tous les campus de l’école si aucun campus assigné */
    campusScopeLabel: row.campusId == null ? 'TOUS' : null,
  };
}

type ProfessorRow = {
  campusId: string | null;
  avatarPath: string | null;
  user: { id: string; avatarPath: string | null } | null;
  [key: string]: unknown;
};

async function enrichProfessorWithAvatar(p: ProfessorRow) {
  const storagePath = p.user?.avatarPath ?? p.avatarPath ?? null;
  const avatarUrl = await uploadsService.getSignedUrlForPath(storagePath);
  const { user, avatarPath: _a, ...rest } = p;
  return {
    ...enrichProfessor(rest as { campusId: string | null }),
    avatarUrl,
    linkedUserId: user?.id ?? null,
  };
}

export const professorsService = {
  async getAll(schoolId: string, query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const filters: ProfessorFilters = {
      campusId: query.campusId as string | undefined,
      search: query.search as string | undefined,
    };

    const { items, total } = await professorsRepository.findAll(schoolId, filters, pagination);
    const enriched = await Promise.all(items.map((p) => enrichProfessorWithAvatar(p as ProfessorRow)));
    return buildPaginated(enriched, total, pagination.page, pagination.limit);
  },

  async getById(id: string, schoolId: string) {
    const professor = await professorsRepository.findById(id, schoolId);
    if (!professor) throw new NotFoundError('Professor');
    return enrichProfessorWithAvatar(professor as ProfessorRow);
  },

  async create(
    schoolId: string,
    data: {
      firstName: string;
      lastName: string;
      email: string;
      userId?: string;
      campusId?: string | null;
      matricule?: string | null;
      numero?: string | null;
      phone?: string | null;
    },
  ) {
    const raw = data.campusId;
    const campusId =
      raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')
        ? null
        : raw;

    if (campusId) {
      const campus = await prisma.campus.findFirst({ where: { id: campusId, schoolId } });
      if (!campus) throw new BadRequestError('Campus does not belong to this school');
    }

    const created = await professorsRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      userId: data.userId,
      campusId,
      matricule: optionalProfileString(data.matricule as string | null | undefined) ?? null,
      numero: optionalProfileString(data.numero as string | null | undefined) ?? null,
      phone: optionalProfileString(data.phone as string | null | undefined) ?? null,
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
      campusId?: string | null;
      matricule?: string | null;
      numero?: string | null;
      phone?: string | null;
    },
  ) {
    let campusId = data.campusId;
    if (campusId === '') campusId = null;

    if (campusId) {
      const campus = await prisma.campus.findFirst({ where: { id: campusId, schoolId } });
      if (!campus) throw new BadRequestError('Campus does not belong to this school');
    }

    const patch = {
      ...data,
      campusId,
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
    return enrichProfessorWithAvatar(updated as ProfessorRow);
  },

  async delete(id: string, schoolId: string) {
    const ok = await professorsRepository.delete(id, schoolId);
    if (!ok) throw new NotFoundError('Professor');
  },

  async uploadAvatar(
    schoolId: string,
    professorId: string,
    file: Express.Multer.File,
    requester: { userId: string; role: Role },
  ) {
    const professor = await professorsRepository.findById(professorId, schoolId);
    if (!professor) throw new NotFoundError('Professor');
    const isStaff = requester.role === Role.ADMIN || requester.role === Role.MANAGER;
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
    const isStaff = requester.role === Role.ADMIN || requester.role === Role.MANAGER;
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
