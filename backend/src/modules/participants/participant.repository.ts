import { pgPool } from '../../db/postgres.js';
import { Participant, ParticipantRole } from '../rides/ride.types.js';

export class ParticipantRepository {
  static async createParticipant(
    rideId: string,
    name: string,
    role: ParticipantRole = 'RIDER'
  ): Promise<Participant> {
    const query = `
      INSERT INTO participants (ride_id, name, role, status)
      VALUES ($1, $2, $3, 'JOINED')
      RETURNING id, ride_id as "rideId", name, role, status, joined_at as "joinedAt"
    `;
    const result = await pgPool.query(query, [rideId, name, role]);
    return result.rows[0];
  }

  static async findParticipantById(id: string): Promise<Participant | null> {
    const query = `
      SELECT id, ride_id as "rideId", name, role, status, joined_at as "joinedAt"
      FROM participants
      WHERE id = $1
    `;
    const result = await pgPool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async getParticipantsByRideId(rideId: string): Promise<Participant[]> {
    const query = `
      SELECT id, ride_id as "rideId", name, role, status, joined_at as "joinedAt"
      FROM participants
      WHERE ride_id = $1 AND status = 'JOINED'
      ORDER BY joined_at ASC
    `;
    const result = await pgPool.query(query, [rideId]);
    return result.rows;
  }
}
