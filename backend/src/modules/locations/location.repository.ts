import { redisClient } from '../../db/redis.js';

export interface LocationPayload {
  participantId: string;
  name?: string;
  role?: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export class LocationRepository {
  private static getKey(code: string): string {
    return `ride:${code.toUpperCase()}:locations`;
  }

  static async saveParticipantLocation(code: string, payload: LocationPayload): Promise<void> {
    if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
      return;
    }
    const key = this.getKey(code);
    await redisClient.hset(key, payload.participantId, JSON.stringify(payload));
    // Set 24-hour expiration on location hash key
    await redisClient.expire(key, 86400);
  }

  static async getRideLocations(code: string): Promise<Record<string, LocationPayload>> {
    if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
      return {};
    }
    const key = this.getKey(code);
    const rawData = await redisClient.hgetall(key);
    const locations: Record<string, LocationPayload> = {};

    for (const [participantId, jsonStr] of Object.entries(rawData)) {
      try {
        locations[participantId] = JSON.parse(jsonStr);
      } catch (err) {
        console.error(`Failed to parse location JSON for participant ${participantId}:`, err);
      }
    }

    return locations;
  }

  static async removeParticipantLocation(code: string, participantId: string): Promise<void> {
    if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
      return;
    }
    const key = this.getKey(code);
    await redisClient.hdel(key, participantId);
  }
}
