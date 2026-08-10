import { createServer } from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { initDatabase, pgPool } from './db/postgres.js';
import { redisClient } from './db/redis.js';
import { RideGateway } from './websocket/ride.gateway.js';

const app = createApp();
const server = createServer(app);
export const rideGateway = new RideGateway(server);

server.listen(env.PORT, async () => {
  console.log(`🚀 RideTogether Backend & WebSockets listening on port ${env.PORT} [${env.NODE_ENV}]`);
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
