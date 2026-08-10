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

export const initDatabase = async (): Promise<void> => {
  try {
    const client = await pgPool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS rides (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        start_name VARCHAR(255) NOT NULL,
        start_latitude DOUBLE PRECISION NOT NULL,
        start_longitude DOUBLE PRECISION NOT NULL,
        destination_name VARCHAR(255) NOT NULL,
        destination_latitude DOUBLE PRECISION NOT NULL,
        destination_longitude DOUBLE PRECISION NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
        organizer_participant_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        started_at TIMESTAMPTZ,
        ended_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'RIDER',
        status VARCHAR(20) NOT NULL DEFAULT 'JOINED',
        last_latitude DOUBLE PRECISION,
        last_longitude DOUBLE PRECISION,
        last_accuracy DOUBLE PRECISION,
        last_heading DOUBLE PRECISION,
        last_speed DOUBLE PRECISION,
        last_location_at TIMESTAMPTZ,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        left_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_rides_code ON rides(code);
      CREATE INDEX IF NOT EXISTS idx_participants_ride_id ON participants(ride_id);
    `);
    client.release();
    console.log('✅ PostgreSQL tables and indexes verified/created.');
  } catch (error) {
    console.error('❌ Failed to initialize PostgreSQL database tables:', error);
  }
};

