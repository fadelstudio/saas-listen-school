import { PaginatedResult } from '../../utils/pagination';
export interface ClassFilters {
    search?: string;
    campusId?: string;
    campusIds?: string[];
    levelId?: string;
    classId?: string;
}
export type PaginatedClasses = PaginatedResult<Record<string, unknown>>;
//# sourceMappingURL=classes.types.d.ts.map