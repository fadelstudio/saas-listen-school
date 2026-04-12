import { professorsRepository } from './professors.repository';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError } from '../../core/errors/AppError';
import { ProfessorFilters } from './professors.types';

export const professorsService = {
  async getAll(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const filters: ProfessorFilters = {
      campusId: query.campusId as string | undefined,
      search:   query.search as string | undefined,
    };

    const { items, total } = await professorsRepository.findAll(filters, pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async getById(id: string) {
    const professor = await professorsRepository.findById(id);
    if (!professor) throw new NotFoundError('Professor');
    return professor;
  },

  async create(data: { firstName: string; lastName: string; email: string; userId?: string }) {
    return professorsRepository.create(data);
  },

  async update(id: string, data: { firstName?: string; lastName?: string; email?: string; userId?: string }) {
    await this.getById(id);
    return professorsRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return professorsRepository.delete(id);
  },
};
