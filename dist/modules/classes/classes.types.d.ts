import { PaginatedResult } from '../../utils/pagination';
export interface ClassFilters {
    search?: string;
    campusId?: string;
    levelId?: string;
}
export type PaginatedClasses = PaginatedResult<Record<string, unknown>>;
//# sourceMappingURL=classes.types.d.ts.map