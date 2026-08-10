import { createApp } from './app.js';
import { env } from './config/env.js';
import { initDatabase, pgPool } from './db/postgres.js';
import { redisClient } from './db/redis.js';

const app = createApp();

const server = app.listen(env.PORT, async () => {
  console.log(`🚀 RideTogether Backend listening on port ${env.PORT} [${env.NODE_ENV}]`);
  await initDatabase();
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}, closing server gracefully...`);
  server.close(async () => {
    try {
      await pgPool.end();
      if (redisClient.status === 'ready') {
        await redisClient.quit();
      }
      console.log('✅ Connections closed. Goodbye!');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
