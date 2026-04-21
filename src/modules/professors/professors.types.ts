import { PaginatedResult } from '../../utils/pagination';

export interface ProfessorFilters {
  search?: string;
}

export type PaginatedProfessors = PaginatedResult<Record<string, unknown>>;
