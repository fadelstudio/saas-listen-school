import type { NextFunction, Request, Response } from "express";
/**
 * Résolution tenant (un seul bool : `tenantResolutionStrict`).
 *
 * **Mode strict (`TENANT_STRICT_MODE=true`)** — multi-tenant « actif » :
 * 1. Sous-domaine
 * 2. Header `x-school-slug` (injecté par le front / outils)
 * Pas de repli `DEFAULT_SCHOOL_SLUG` ni path API.
 *
 * **Mode non strict (`TENANT_STRICT_MODE=false`)** — repli autorisé :
 * 1. Sous-domaine
 * 2. `x-school-slug`
 * 3. Path `/<slug>/api/...` (sans variable séparée)
 * 4. `DEFAULT_SCHOOL_SLUG` — seule source env pour le slug par défaut (`env.tenantDefaultSlug`).
 */
export declare function resolveSchoolMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=resolveSchool.middleware.d.ts.map