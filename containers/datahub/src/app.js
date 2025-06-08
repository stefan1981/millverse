import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

import routesPostgres from './routes/routesPostgres.js';
import routesHealth from './routes/routesHealth.js';
import routesIncident from './routes/routesIncident.js';

//import { EtlScheduler } from './lib/etl/EtlScheduler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Enable JSON parsing



//const etlScheduler = new EtlScheduler();
//etlScheduler.createSchedulerTable();

//etlScheduler.startBackgroundScheduler();

// redirect root to /api
app.get('/', (req, res) => {
  res.redirect('/api');
});

// Swagger UI setup
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Enable middleware only if ENABLE_AUTHORIZATION is set to "true"
if (process.env.ENABLE_AUTHORIZATION !== 'false') {
  const excludedPaths = [
    '/incident/insert-incident',
    '/incident/fix-incident',
    '/postgres/table-truncate',
  ];

  app.use((req, res, next) => {
    // Allow excluded paths without API key
    if (excludedPaths.includes(req.path)) {
      return next();
    }

    // Require API key for everything else
    if (req.header('x-api-key') !== process.env.SWAGGER_API_KEY) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  });
}

// Use routes
app.use('/incident', routesIncident);
app.use('/postgres', routesPostgres);
app.use('/health', routesHealth);

// Swagger UI setup
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
