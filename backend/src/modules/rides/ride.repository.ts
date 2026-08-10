import { pgPool } from '../../db/postgres.js';
import { CreateRideDto, Ride } from './ride.types.js';

export class RideRepository {
  static async createRide(code: string, dto: CreateRideDto): Promise<Ride> {
    const query = `
      INSERT INTO rides (
        code, name,
        start_name, start_latitude, start_longitude,
        destination_name, destination_latitude, destination_longitude,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'WAITING')
      RETURNING 
        id, code, name, status,
        start_name as "startName", start_latitude as "startLatitude", start_longitude as "startLongitude",
        destination_name as "destName", destination_latitude as "destLatitude", destination_longitude as "destLongitude",
        organizer_participant_id as "organizerParticipantId", created_at as "createdAt"
    `;

    const values = [
      code.toUpperCase(),
      dto.name,
      dto.start.name,
      dto.start.latitude,
      dto.start.longitude,
      dto.destination.name,
      dto.destination.latitude,
      dto.destination.longitude,
    ];

    const result = await pgPool.query(query, values);
    const row = result.rows[0];

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      status: row.status,
      start: {
        name: row.startName,
        latitude: parseFloat(row.startLatitude),
        longitude: parseFloat(row.startLongitude),
      },
      destination: {
        name: row.destName,
        latitude: parseFloat(row.destLatitude),
        longitude: parseFloat(row.destLongitude),
      },
      organizerParticipantId: row.organizerParticipantId,
      createdAt: row.createdAt,
    };
  }

  static async updateOrganizerParticipantId(rideId: string, participantId: string): Promise<void> {
    const query = `UPDATE rides SET organizer_participant_id = $1 WHERE id = $2`;
    await pgPool.query(query, [participantId, rideId]);
  }

  static async findByCode(code: string): Promise<Ride | null> {
    const query = `
      SELECT 
        id, code, name, status,
        start_name as "startName", start_latitude as "startLatitude", start_longitude as "startLongitude",
        destination_name as "destName", destination_latitude as "destLatitude", destination_longitude as "destLongitude",
        organizer_participant_id as "organizerParticipantId", created_at as "createdAt"
      FROM rides
      WHERE UPPER(code) = UPPER($1)
    `;

    const result = await pgPool.query(query, [code]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      status: row.status,
      start: {
        name: row.startName,
        latitude: parseFloat(row.startLatitude),
        longitude: parseFloat(row.startLongitude),
      },
      destination: {
        name: row.destName,
        latitude: parseFloat(row.destLatitude),
        longitude: parseFloat(row.destLongitude),
      },
      organizerParticipantId: row.organizerParticipantId,
      createdAt: row.createdAt,
    };
  }
}
