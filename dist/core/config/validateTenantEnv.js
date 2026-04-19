"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTenantEnvOnStartup = validateTenantEnvOnStartup;
const prisma_1 = require("../database/prisma");
const env_1 = require("./env");
/**
 * En mode strict, `DEFAULT_SCHOOL_SLUG` n'est pas utilisé pour la résolution — pas de contrôle DB.
 * En mode non strict, vérifie que le slug par défaut existe dans `schools` (évite typos silencieuses).
 * En production non strict, une valeur invalide fait échouer le démarrage.
 */
async function validateTenantEnvOnStartup() {
    if (env_1.env.tenantResolutionStrict) {
        return;
    }
    const raw = env_1.env.tenantDefaultSlug;
    if (!raw) {
        return;
    }
    const slug = raw.toLowerCase();
    const school = await prisma_1.prisma.school.findUnique({
        where: { slug },
        select: { id: true, slug: true },
    });
    if (school) {
        if (env_1.env.NODE_ENV === "development") {
            console.log(`✅ DEFAULT_SCHOOL_SLUG → schools.slug="${school.slug}"`);
        }
        return;
    }
    const msg = `DEFAULT_SCHOOL_SLUG="${raw}" ne correspond à aucune ligne dans schools.slug. ` +
        `Le repli env ne fonctionnera pas. ` +
        `Si le login passe encore, c’est que le front envoie x-school-slug (ou sous-domaine) avec un slug valide.`;
    console.error(`\n❌ ${msg}\n`);
    if (!env_1.env.tenantResolutionStrict && env_1.env.NODE_ENV === "production") {
        process.exit(1);
    }
}
//# sourceMappingURL=validateTenantEnv.js.map