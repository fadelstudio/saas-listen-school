import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
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
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
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
    },
    tags: [
      { name: '1. Authentication', description: 'Endpoints pour se connecter et gérer son compte' },
      { name: 'SaaS', description: '[SUPERADMIN] Administration globale' },
      { name: 'System', description: 'Configuration du système' },
      { name: 'Campuses', description: 'Gestion des campus / écoles' },
      { name: 'Classes', description: 'Gestion des classes et niveaux' },
      { name: 'Professors', description: 'Gestion des enseignants' },
      { name: 'Academic Modules', description: 'Gestion des matières' },
      { name: 'Reports', description: 'Signalements et incidents' },
      { name: 'Evaluations', description: 'Évaluations pédagogiques' },
      { name: 'Decisions', description: 'Actions et décisions administratives' },
      { name: 'AI', description: 'Analyses et Chat IA' },
      { name: 'Uploads', description: 'Gestion des fichiers' },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.route.ts', './src/app.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
