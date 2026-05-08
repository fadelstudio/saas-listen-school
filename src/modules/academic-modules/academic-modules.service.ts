import { academicModulesRepository } from './academic-modules.repository';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError, ForbiddenError } from '../../core/errors/AppError';
import { AcademicModuleFilters } from './academic-modules.types';

export const academicModulesService = {
  async getAll(schoolId: string, query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const filters: AcademicModuleFilters = {
      search: query.search as string | undefined,
    };

    const { items, total } = await academicModulesRepository.findAll(schoolId, filters, pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async getById(id: string, schoolId: string) {
    const module = await academicModulesRepository.findById(id, schoolId);
    if (!module) throw new NotFoundError('Academic Module');
    return module;
  },

  async create(schoolId: string, data: { name: string; code?: string }, userRole?: string) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');
    return academicModulesRepository.create(schoolId, data);
  },

  async update(id: string, schoolId: string, data: { name?: string; code?: string }, userRole?: string) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');
    const updated = await academicModulesRepository.update(id, schoolId, data);
    if (!updated) throw new NotFoundError('Academic Module');
    return updated;
  },

  async delete(id: string, schoolId: string, userRole?: string) {
    if (userRole === 'VIEWER') throw new ForbiddenError('VIEWER role is read-only');
    const ok = await academicModulesRepository.delete(id, schoolId);
    if (!ok) throw new NotFoundError('Academic Module');
  },
};
