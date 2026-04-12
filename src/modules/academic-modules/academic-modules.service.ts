import { academicModulesRepository } from './academic-modules.repository';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError } from '../../core/errors/AppError';
import { AcademicModuleFilters } from './academic-modules.types';

export const academicModulesService = {
  async getAll(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const filters: AcademicModuleFilters = {
      search:  query.search as string | undefined,
    };

    const { items, total } = await academicModulesRepository.findAll(filters, pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async getById(id: string) {
    const module = await academicModulesRepository.findById(id);
    if (!module) throw new NotFoundError('Academic Module');
    return module;
  },

  async create(data: { name: string; code?: string }) {
    return academicModulesRepository.create(data);
  },

  async update(id: string, data: { name?: string; code?: string }) {
    await this.getById(id);
    return academicModulesRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return academicModulesRepository.delete(id);
  },
};
