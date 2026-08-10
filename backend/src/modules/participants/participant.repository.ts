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
      VALUES ($1::UUID, $2, $3, 'JOINED')
      RETURNING id, ride_id as "rideId", name, role, status, joined_at as "joinedAt"
    `;
    const result = await pgPool.query(query, [rideId, name, role]);
    return result.rows[0];
  }

  static async findParticipantById(id: string): Promise<Participant | null> {
    const query = `
      SELECT id, ride_id as "rideId", name, role, status, joined_at as "joinedAt"
      FROM participants
      WHERE id = $1::UUID
    `;
    const result = await pgPool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async getParticipantsByRideId(rideId: string): Promise<Participant[]> {
    const query = `
      SELECT id, ride_id as "rideId", name, role, status, joined_at as "joinedAt"
      FROM participants
      WHERE ride_id = $1::UUID AND status = 'JOINED'
      ORDER BY joined_at ASC
    `;
    const result = await pgPool.query(query, [rideId]);
    return result.rows;
  }

  static async updateParticipantStatus(id: string, status: 'JOINED' | 'LEFT' | 'REMOVED'): Promise<Participant | null> {
    const query = `
      UPDATE participants
      SET status = $1::VARCHAR, left_at = CASE WHEN $1::VARCHAR IN ('LEFT', 'REMOVED') THEN NOW() ELSE NULL END
      WHERE id = $2::UUID
      RETURNING id, ride_id as "rideId", name, role, status, joined_at as "joinedAt"
    `;
    const result = await pgPool.query(query, [status, id]);
    return result.rows[0] || null;
  }
}
