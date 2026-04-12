"use strict";
// No express imports needed here
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
exports.buildPaginated = buildPaginated;
/**
 * Parses ?page, ?limit, ?sortBy, ?sortOrder from query string.
 * Safe defaults: page=1, limit=20, sortBy=createdAt, sortOrder=desc.
 */
function parsePagination(query) {
    const page = Math.max(1, parseInt(String(query.page ?? '1'), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? '20'), 10) || 20));
    const skip = (page - 1) * limit;
    const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    return { page, limit, skip, sortBy, sortOrder };
}
function buildPaginated(items, total, page, limit) {
    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
//# sourceMappingURL=pagination.js.map