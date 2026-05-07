import { campusesRepository } from './campuses.repository';
import { parsePagination, buildPaginated } from '../../utils/pagination';
import { NotFoundError } from '../../core/errors/AppError';
import { CampusFilters } from './campuses.types';

export const campusesService = {
  async getAll(
    schoolId: string,
    query: Record<string, unknown>,
    userRole?: string,
    userCampusIds?: string[],
  ) {
    const pagination = parsePagination(query);
    const filters: CampusFilters = {
      search: query.search as string | undefined,
      campusIds:
        ['ADMIN', 'MANAGER', 'VIEWER'].includes(userRole || '') && userCampusIds && userCampusIds.length > 0
          ? userCampusIds
          : undefined,
    };

    const { items, total } = await campusesRepository.findAll(schoolId, filters, pagination);
    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async getById(id: string, schoolId: string, userRole?: string, userCampusIds?: string[]) {
    if (
      ['ADMIN', 'MANAGER', 'VIEWER'].includes(userRole || '') &&
      userCampusIds &&
      userCampusIds.length > 0 &&
      !userCampusIds.includes(id)
    ) {
      throw new NotFoundError('Campus');
    }
    const campus = await campusesRepository.findById(id, schoolId);
    if (!campus) throw new NotFoundError('Campus');
    return campus;
  },

  async create(data: { name: string; schoolId: string; location?: string }) {
    return campusesRepository.create(data);
  },

  async update(id: string, data: { name?: string; location?: string }, schoolId: string) {
    await this.getById(id, schoolId);
    return campusesRepository.update(id, data, schoolId);
  },

  async delete(id: string, schoolId: string) {
    await this.getById(id, schoolId);
    return campusesRepository.delete(id, schoolId);
  },

  async getClasses(id: string, schoolId: string, userRole?: string, userCampusIds?: string[]) {
    await this.getById(id, schoolId, userRole, userCampusIds);
    // Directly using prisma for the linking query to avoid circular dependencies if any
    return campusesRepository.findClasses(id, schoolId);
  },

  async getStudents(id: string, schoolId: string, userRole?: string, userCampusIds?: string[]) {
    await this.getById(id, schoolId, userRole, userCampusIds);
    return campusesRepository.findStudents(id, schoolId);
  },

  async getStats(id: string, schoolId: string) {
    return campusesRepository.getStats(id, schoolId);
  },

  async getProfessors(id: string, schoolId: string, userRole?: string, userCampusIds?: string[]) {
    await this.getById(id, schoolId, userRole, userCampusIds);
    return campusesRepository.findProfessors(id, schoolId);
  },
};
