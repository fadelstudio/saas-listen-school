import { levelsRepository } from './levels.repository';
import { NotFoundError } from '../../core/errors/AppError';

export const levelsService = {
  async getAll() {
    return levelsRepository.findAll();
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
