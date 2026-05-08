import { academicModulesRepository } from './academic-modules.repository';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError, ForbiddenError } from '../../core/errors/AppError';
import { AcademicModuleFilters } from './academic-modules.types';
import { auditService } from '../audit/audit.service';

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

  async create(schoolId: string, data: { name: string; code?: string }, userRole?: string, userId?: string) {
    if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole || '')) {
      throw new ForbiddenError('Insufficient permissions to create modules');
    }
    const mod = await academicModulesRepository.create(schoolId, data);
    
    await auditService.log({
      schoolId,
      userId,
      action: 'CREATE_MODULE',
      entity: 'AcademicModule',
      entityId: mod.id,
      details: { name: mod.name, code: mod.code }
    });

    return mod;
  },

  async update(id: string, schoolId: string, data: { name?: string; code?: string }, userRole?: string, userId?: string) {
    if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole || '')) {
      throw new ForbiddenError('Insufficient permissions to update modules');
    }
    const updated = await academicModulesRepository.update(id, schoolId, data);
    if (!updated) throw new NotFoundError('Academic Module');

    await auditService.log({
      schoolId,
      userId,
      action: 'UPDATE_MODULE',
      entity: 'AcademicModule',
      entityId: id,
      details: { updatedFields: Object.keys(data) }
    });

    return updated;
  },

  async delete(id: string, schoolId: string, userRole?: string, userId?: string) {
    if (!['ADMIN', 'MANAGER', 'SUPERADMIN'].includes(userRole || '')) {
      throw new ForbiddenError('Insufficient permissions to delete modules');
    }
    const ok = await academicModulesRepository.delete(id, schoolId);
    if (!ok) throw new NotFoundError('Academic Module');

    await auditService.log({
      schoolId,
      userId,
      action: 'DELETE_MODULE',
      entity: 'AcademicModule',
      entityId: id,
    });
  },
};
