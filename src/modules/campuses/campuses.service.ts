import { campusesRepository } from './campuses.repository';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError } from '../../core/errors/AppError';
import { CampusFilters } from './campuses.types';

export const campusesService = {
  async getAll(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const filters: CampusFilters = {
      search: query.search as string | undefined,
    };

    const { items, total } = await campusesRepository.findAll(filters, pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async getById(id: string) {
    const campus = await campusesRepository.findById(id);
    if (!campus) throw new NotFoundError('Campus');
    return campus;
  },

  async create(data: { name: string; location?: string }) {
    return campusesRepository.create(data);
  },

  async update(id: string, data: { name?: string; location?: string }) {
    await this.getById(id);
    return campusesRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return campusesRepository.delete(id);
  },
};
