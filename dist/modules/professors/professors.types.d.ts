import { PaginatedResult } from '../../utils/pagination';
export interface ProfessorFilters {
    search?: string;
    campusId?: string;
}
export type PaginatedProfessors = PaginatedResult<Record<string, unknown>>;
//# sourceMappingURL=professors.types.d.ts.map