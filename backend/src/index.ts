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

let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n🛑 Received ${signal}, closing server gracefully...`);

  // Fallback timer to ensure process exits within 2 seconds if connections remain open
  const timer = setTimeout(() => {
    console.log('⚡ Timeout reached during shutdown. Forcing exit.');
    process.exit(0);
  }, 2000);
  timer.unref();

  try {
    // 1. Close WebSockets (Socket.IO)
    if (rideGateway) {
      rideGateway.getIO().close();
    }

    // 2. Close HTTP Server
    server.close();

    // 3. Close PostgreSQL pool
    await pgPool.end();

    // 4. Close Redis client
    if (redisClient.status === 'ready' || redisClient.status === 'connecting') {
      await redisClient.quit();
    }

    console.log('✅ Connections closed cleanly. Goodbye!');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
