/**
 * Parses ?page, ?limit, ?sortBy, ?sortOrder from query string.
 * Safe defaults: page=1, limit=20, sortBy=createdAt, sortOrder=desc.
 */
export declare function parsePagination(query: Record<string, unknown>): {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
};
/**
 * Shape for all paginated API responses.
 */
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare function buildPaginated<T>(items: T[], total: number, page: number, limit: number): PaginatedResult<T>;
//# sourceMappingURL=pagination.d.ts.map