import { Redis } from 'ioredis';
import { env } from '../config/env.js';

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) {
      return null;
    }
    return Math.min(times * 100, 3000);
  },
  lazyConnect: true,
});

redisClient.on('error', (err) => {
  console.error(' Redis Client Error:', err);
});

export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
      await redisClient.connect();
    }
    const ping = await redisClient.ping();
    return ping === 'PONG';
  } catch (error) {
    console.error('Redis connection check failed:', error);
    return false;
  }
};
