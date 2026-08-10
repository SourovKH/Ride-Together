import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.routes.js';
import { rideRouter } from './routes/ride.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json());

  // Mount API routes
  app.use('/api', healthRouter);
  app.use('/api/rides', rideRouter);

  // 404 Handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Resource not found',
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
