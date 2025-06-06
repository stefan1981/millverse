import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API for Semantic Search and Mapping',
      version: '1.0.0',
      description: 'This API provides endpoints for working with semantic search and mapping.',
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/routesPostgres.js',
    './src/routes/routesIncident.js',
    './src/routes/routesHealth.js',
  ], // Path to API docs (JSDoc comments)
};

export default swaggerJsdoc(options);
