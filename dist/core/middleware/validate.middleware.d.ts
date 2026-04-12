import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
interface ValidateTarget {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
}
/**
 * Generic Zod validation middleware.
 * Usage: validate({ body: mySchema }) or validate({ params: idSchema, body: updateSchema })
 */
export declare function validate(schemas: ValidateTarget): (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.middleware.d.ts.map