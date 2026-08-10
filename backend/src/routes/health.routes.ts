import { Router, Request, Response } from 'express';
import { checkPostgresHealth } from '../db/postgres.js';
import { checkRedisHealth } from '../db/redis.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req: Request, res: Response) => {
  const isPostgresHealthy = await checkPostgresHealth();
  const isRedisHealthy = await checkRedisHealth();

  const isHealthy = isPostgresHealthy && isRedisHealthy;

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      postgres: isPostgresHealthy ? 'connected' : 'disconnected',
      redis: isRedisHealthy ? 'connected' : 'disconnected',
    },
  });
});
