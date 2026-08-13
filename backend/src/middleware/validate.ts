import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validates req.body/query/params against Zod schemas and replaces them with
 * the parsed (and therefore typed + coerced + defaulted) result. Every route
 * that accepts input uses this rather than trusting raw req.body — this is
 * also where "never trust frontend prices/discounts" is enforced structurally:
 * price/discount fields simply aren't accepted from request bodies that
 * create orders (see order schemas in Phase 6/7).
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (err) {
      next(err); // caught by errorHandler as a ZodError
    }
  };
}
