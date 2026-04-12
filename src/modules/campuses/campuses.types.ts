import { PaginatedResult } from '../../utils/pagination';

export interface CampusFilters {
  search?: string;
}

export type PaginatedCampuses = PaginatedResult<Record<string, unknown>>;
