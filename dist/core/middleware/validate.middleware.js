"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
/**
 * Generic Zod validation middleware.
 * Usage: validate({ body: mySchema }) or validate({ params: idSchema, body: updateSchema })
 */
function validate(schemas) {
    return (req, _res, next) => {
        if (schemas.body) {
            req.body = schemas.body.parse(req.body);
        }
        if (schemas.params) {
            const parsedParams = schemas.params.parse(req.params);
            // Express 5 req.params is read-only (getter), we must update keys individually
            Object.keys(req.params).forEach((k) => delete req.params[k]);
            Object.assign(req.params, parsedParams);
        }
        if (schemas.query) {
            const parsedQuery = schemas.query.parse(req.query);
            // Express 5 req.query is read-only (getter), we must update keys individually
            Object.keys(req.query).forEach((k) => delete req.query[k]);
            Object.assign(req.query, parsedQuery);
        }
        next();
    };
}
//# sourceMappingURL=validate.middleware.js.map