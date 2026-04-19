import { levelsRepository } from './levels.repository';
import { NotFoundError } from '../../core/errors/AppError';
import { parsePagination, buildPaginated } from '../../utils/pagination';

export const levelsService = {
  async getAll(schoolId: string, query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const { items, total } = await levelsRepository.findAll(schoolId, pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async getById(id: string, schoolId: string) {
    const level = await levelsRepository.findById(id, schoolId);
    if (!level) throw new NotFoundError('Academic Level');
    return level;
  },

  async create(schoolId: string, data: { name: string; order?: number }) {
    return levelsRepository.create(schoolId, data);
  },

  async update(id: string, schoolId: string, data: { name?: string; order?: number }) {
    const updated = await levelsRepository.update(id, schoolId, data);
    if (!updated) throw new NotFoundError('Academic Level');
    return updated;
  },

  async delete(id: string, schoolId: string) {
    const ok = await levelsRepository.delete(id, schoolId);
    if (!ok) throw new NotFoundError('Academic Level');
  },
};
