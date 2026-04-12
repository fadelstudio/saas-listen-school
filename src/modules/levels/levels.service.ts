import { levelsRepository } from './levels.repository';
import { NotFoundError } from '../../core/errors/AppError';
import { parsePagination, buildPaginated } from '../../utils/pagination';

export const levelsService = {
  async getAll(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const { items, total } = await levelsRepository.findAll(pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async getById(id: string) {
    const level = await levelsRepository.findById(id);
    if (!level) throw new NotFoundError('Academic Level');
    return level;
  },

  async create(data: { name: string; order?: number }) {
    return levelsRepository.create(data);
  },

  async update(id: string, data: { name?: string; order?: number }) {
    await this.getById(id);
    return levelsRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return levelsRepository.delete(id);
  },
};
