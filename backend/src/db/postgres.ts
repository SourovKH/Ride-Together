import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const pgPool = new Pool({
  connectionString: env.DATABASE_URL,
});

pgPool.on('error', (err) => {
  console.error(' Unexpected PostgreSQL pool error:', err);
});

export const checkPostgresHealth = async (): Promise<boolean> => {
  try {
    const client = await pgPool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('PostgreSQL connection check failed:', error);
    return false;
  }
};
