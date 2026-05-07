import { Prisma } from '@prisma/client';
import { classesRepository } from './classes.repository';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError, BadRequestError } from '../../core/errors/AppError';
import { ClassFilters } from './classes.types';
import { prisma } from '../../core/database/prisma';

export const classesService = {
  async getAll(
    schoolId: string,
    query: Record<string, unknown>,
    userRole?: string,
    userCampusIds?: string[],
    userClassId?: string | null
  ) {
    const pagination = parsePagination(query);
    const filters: ClassFilters = {
      campusId: query.campusId as string | undefined,
      levelId: query.levelId as string | undefined,
      search: query.search as string | undefined,
    };
    if (['ADMIN', 'MANAGER', 'VIEWER'].includes(userRole || '') && userCampusIds && userCampusIds.length > 0) {
      if (filters.campusId && !userCampusIds.includes(filters.campusId)) {
        throw new BadRequestError('Requested campus is outside your scope');
      }
      if (!filters.campusId) filters.campusIds = userCampusIds;
    }
    if (userRole === 'STUDENT' && userClassId) {
      filters.classId = userClassId;
    }

    const { items, total } = await classesRepository.findAll(schoolId, filters, pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async getById(id: string, schoolId: string, userRole?: string, userCampusIds?: string[]) {
    const cl = await classesRepository.findById(id, schoolId);
    if (!cl) throw new NotFoundError('Class');
    if (
      ['ADMIN', 'MANAGER', 'VIEWER'].includes(userRole || '') &&
      userCampusIds &&
      userCampusIds.length > 0 &&
      !userCampusIds.includes(cl.campusId)
    ) {
      throw new NotFoundError('Class');
    }
    return cl;
  },

  async create(schoolId: string, data: { name: string; campusId: string; levelId: string }) {
    const campus = await prisma.campus.findFirst({
      where: { id: data.campusId, schoolId },
    });
    if (!campus) throw new BadRequestError('Campus does not belong to this school');
    const levelWhere = Prisma.validator<Prisma.AcademicLevelWhereInput>()({
      id: data.levelId,
      schoolId,
    });
    const level = await prisma.academicLevel.findFirst({ where: levelWhere });
    if (!level) throw new BadRequestError('Academic level does not belong to this school');
    return classesRepository.create(data);
  },

  async update(id: string, schoolId: string, data: { name?: string; campusId?: string; levelId?: string }) {
    if (data.campusId) {
      const campus = await prisma.campus.findFirst({
        where: { id: data.campusId, schoolId },
      });
      if (!campus) throw new BadRequestError('Campus does not belong to this school');
    }
    if (data.levelId) {
      const levelWhere = Prisma.validator<Prisma.AcademicLevelWhereInput>()({
        id: data.levelId,
        schoolId,
      });
      const level = await prisma.academicLevel.findFirst({ where: levelWhere });
      if (!level) throw new BadRequestError('Academic level does not belong to this school');
    }
    const updated = await classesRepository.update(id, schoolId, data);
    if (!updated) throw new NotFoundError('Class');
    return updated;
  },

  async delete(id: string, schoolId: string) {
    const ok = await classesRepository.delete(id, schoolId);
    if (!ok) throw new NotFoundError('Class');
  },

  async getStudents(id: string, schoolId: string, userRole?: string, userCampusIds?: string[]) {
    await this.getById(id, schoolId, userRole, userCampusIds);
    return classesRepository.findStudents(id, schoolId);
  },
};
