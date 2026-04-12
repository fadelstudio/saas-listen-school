import { classModulesRepository } from './class-modules.repository';
import { NotFoundError, ConflictError } from '../../core/errors/AppError';

export const classModulesService = {
  async getAll(filters: { classId?: string; moduleId?: string }) {
    return classModulesRepository.findAll(filters);
  },

  async getById(id: string) {
    const assignment = await classModulesRepository.findById(id);
    if (!assignment) throw new NotFoundError('Module Assignment');
    return assignment;
  },

  async create(data: { classId: string; moduleId: string; professorIds?: string[] }) {
    // Check if assignment already exists
    const existing = await classModulesRepository.findByClassAndModule(data.classId, data.moduleId);
    if (existing) {
      throw new ConflictError('This module is already assigned to this class');
    }
    return classModulesRepository.create(data);
  },

  async update(id: string, data: { professorIds?: string[] }) {
    await this.getById(id);
    return classModulesRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return classModulesRepository.delete(id);
  },
};
