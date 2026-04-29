import { PaginatedResult } from '../../utils/pagination';

export interface ProfessorFilters {
  search?: string;
  classId?: string;
  campusId?: string;
}


export type PaginatedProfessors = PaginatedResult<Record<string, unknown>>;
