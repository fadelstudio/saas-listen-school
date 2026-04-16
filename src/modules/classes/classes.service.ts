import { classesRepository } from './classes.repository';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError } from '../../core/errors/AppError';
import { ClassFilters } from './classes.types';

export const classesService = {
  async getAll(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const filters: ClassFilters = {
      campusId: query.campusId as string | undefined,
      levelId:  query.levelId as string | undefined,
      search:   query.search as string | undefined,
    };

    const { items, total } = await classesRepository.findAll(filters, pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async getById(id: string) {
    const cl = await classesRepository.findById(id);
    if (!cl) throw new NotFoundError('Class');
    return cl;
  },

  async create(data: { name: string; campusId: string; levelId: string }) {
    return classesRepository.create(data);
  },

  async update(id: string, data: { name?: string; campusId?: string; levelId?: string }) {
    await this.getById(id);
    return classesRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return classesRepository.delete(id);
  },

  async getStudents(id: string) {
    await this.getById(id);
    return classesRepository.findStudents(id);
  },
};
