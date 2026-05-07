import { PaginatedResult } from '../../utils/pagination';

export interface CampusFilters {
  search?: string;
  campusIds?: string[];
}

export type PaginatedCampuses = PaginatedResult<Record<string, unknown>>;
