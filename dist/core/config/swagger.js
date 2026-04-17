"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const env_1 = require("./env");
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AFI-LISTEN API',
            version: '1.0.0',
            description: 'API de signalement, évaluation et analyse académique AFI-LISTEN.',
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
                url: `http://127.0.0.1:${env_1.env.PORT}`,
                description: `Local API (explicit — PORT=${env_1.env.PORT})`,
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
            schemas: {
                PaginationMeta: {
                    type: 'object',
                    properties: {
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 10 },
                        total: { type: 'number', example: 42 },
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
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map