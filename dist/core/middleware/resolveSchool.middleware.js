"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSchoolMiddleware = resolveSchoolMiddleware;
const prisma_1 = require("../database/prisma");
const env_1 = require("../config/env");
const AppError_1 = require("../errors/AppError");
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
function normalizeSlug(value) {
    if (!value)
        return null;
    const cleaned = value.trim().toLowerCase();
    return cleaned.length > 0 ? cleaned : null;
}
/** Priorité 1 — sous-domaine : `afi.monsite.com` → `afi` (ignoré sur localhost). */
function slugFromHostname(hostnameRaw) {
    if (!hostnameRaw)
        return null;
    const hostname = hostnameRaw.split(":")[0].toLowerCase();
    if (!hostname || LOCAL_HOSTS.has(hostname))
        return null;
    const parts = hostname.split(".").filter(Boolean);
    if (parts.length < 3)
        return null;
    return normalizeSlug(parts[0]);
}
/** Priorité 2 (non strict, optionnel) — `https://host/SLUG/api/v1/...`. */
function slugFromOriginalUrl(originalUrl) {
    if (!originalUrl)
        return null;
    const pathname = originalUrl.split("?")[0];
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length < 2)
        return null;
    const reserved = new Set([
        "api",
        "health",
        "api-docs",
        "v1",
        "static",
        "favicon.ico",
    ]);
    const first = normalizeSlug(parts[0]);
    const second = parts[1]?.toLowerCase();
    if (!first || reserved.has(first))
        return null;
    if (second === "api")
        return first;
    return null;
}
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
async function resolveSchoolMiddleware(req, _res, next) {
    const strict = env_1.env.tenantResolutionStrict;
    const hostnameSlug = slugFromHostname(req.hostname);
    const headerSlug = normalizeSlug(req.header("x-school-slug"));
    let resolvedSlug = hostnameSlug ?? headerSlug ?? null;
    if (!strict) {
        if (!resolvedSlug) {
            resolvedSlug = slugFromOriginalUrl(req.originalUrl);
        }
        if (!resolvedSlug) {
            resolvedSlug = normalizeSlug(env_1.env.tenantDefaultSlug);
        }
    }
    if (!resolvedSlug) {
        const hint = env_1.env.tenantResolutionStrict
            ? "Mode strict: envoyer le header x-school-slug ou utiliser un sous-domaine tenant."
            : "Mode non strict: envoyer x-school-slug, appeler /<slug>/api/v1/..., ou définir DEFAULT_SCHOOL_SLUG (aligné sur schools.slug).";
        throw new AppError_1.NotFoundError("School", `School not found: aucun contexte école résolu. ${hint}`);
    }
    const school = await prisma_1.prisma.school.findUnique({
        where: { slug: resolvedSlug },
        select: { id: true, slug: true, name: true, domain: true },
    });
    if (!school) {
        throw new AppError_1.NotFoundError("School", `School not found: aucune école en base pour le slug « ${resolvedSlug} ». Vérifiez x-school-slug (ou DEFAULT_SCHOOL_SLUG en non strict).`);
    }
    req.schoolId = school.id;
    req.school = {
        id: school.id,
        slug: school.slug,
        name: school.name,
        domain: school.domain,
    };
    next();
}
//# sourceMappingURL=resolveSchool.middleware.js.map