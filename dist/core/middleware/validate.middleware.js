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
            req.params = schemas.params.parse(req.params);
        }
        if (schemas.query) {
            req.query = schemas.query.parse(req.query);
        }
        next();
    };
}
//# sourceMappingURL=validate.middleware.js.map