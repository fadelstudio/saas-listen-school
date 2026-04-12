import { PaginatedResult } from '../../utils/pagination';

export interface AcademicModuleFilters {
  search?: string;
  classId?: string;
}

export type PaginatedAcademicModules = PaginatedResult<Record<string, unknown>>;
