import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AFI-LISTEN API',
      version: '1.0.0',
      description:
        "API AFI-LISTEN. Multi-tenant: TENANT_STRICT_MODE=true → sous-domaine + x-school-slug uniquement; false → + path /slug/api/... puis DEFAULT_SCHOOL_SLUG (un seul booléen côté API).",
      contact: {
        name: 'AFI Development Team',
      },
    },
    // Order matters: Swagger UI defaults to the first entry. A relative URL
    // resolves to the same host as the docs page, so "Try it out" works on
    // Railway, Render, and localhost without picking the wrong origin.
    servers: [
      {
        url: '/',
        description: 'Current host (recommended — Try it out uses this site)',
      },
      {
        url: 'https://saas-listen.up.railway.app',
        description: 'Railway (production)',
      },
      {
        url: `http://127.0.0.1:${env.PORT}`,
        description: `Local API (explicit — PORT=${env.PORT})`,
      },
      {
        url: 'https://saas-listen.onrender.com',
        description: 'Render (legacy)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      parameters: {
        SchoolSlugHeader: {
          name: 'x-school-slug',
          in: 'header',
          required: false,
          schema: { type: 'string', example: 'afi' },
          description:
            "Fallback tenant en dev/tests quand le sous-domaine n'est pas disponible. En mode strict, si aucun contexte école n'est résolu: 404.",
        },
      },
      schemas: {
        PaginationMeta: {
          type: 'object',
          properties: {
            page:       { type: 'number', example: 1 },
            limit:      { type: 'number', example: 10 },
            total:      { type: 'number', example: 42 },
            totalPages: { type: 'number', example: 5 },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Endpoints pour se connecter et gérer son compte' },
      { name: 'SaaS', description: '[SUPERADMIN] Administration globale' },
      { name: 'System', description: 'Configuration du système' },
      { name: 'Campuses', description: 'Gestion des campus / écoles' },
      { name: 'Classes', description: 'Gestion des classes et niveaux' },
      { name: 'Professors', description: 'Gestion des enseignants' },
      { name: 'Academic Modules', description: 'Gestion des matières' },
      { name: 'Reports', description: 'Signalements et incidents' },
      { name: 'Evaluations', description: 'Évaluations pédagogiques' },
      { name: 'School Users', description: 'Comptes staff et élèves (ADMIN campus)' },
      { name: 'Decisions', description: 'Actions et décisions administratives' },
      { name: 'AI', description: 'Analyses et Chat IA' },
      { name: 'Notifications', description: 'Système d\'alertes' },
      { name: 'Uploads', description: 'Gestion des fichiers' },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.route.ts', './src/core/routes/v1.ts', './src/app.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
