import crypto from 'crypto';
import { ParticipantRepository } from '../participants/participant.repository.js';
import { RideRepository } from './ride.repository.js';
import { routingService } from '../routing/routing.service.js';
import {
  CreateRideDto,
  CreateRideResponse,
  GetRideResponse,
  JoinRideDto,
  JoinRideResponse,
} from './ride.types.js';

export class RideService {
  private static ALPHANUMERIC_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes easily confused 0, O, 1, I

  static generateCode(length = 6): string {
    let result = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      const index = bytes[i] % this.ALPHANUMERIC_CHARS.length;
      result += this.ALPHANUMERIC_CHARS[index];
    }
    return result;
  }

  static async generateUniqueCode(): Promise<string> {
    let attempts = 0;
    while (attempts < 10) {
      const code = this.generateCode(6);
      const existing = await RideRepository.findByCode(code);
      if (!existing) return code;
      attempts++;
    }
    throw new Error('Failed to generate a unique ride code. Please try again.');
  }

  static async createRide(dto: CreateRideDto): Promise<CreateRideResponse> {
    const code = await this.generateUniqueCode();
    const ride = await RideRepository.createRide(code, dto);

    const organizerName = dto.organizerName?.trim() || 'Organizer';
    const participant = await ParticipantRepository.createParticipant(
      ride.id,
      organizerName,
      'ORGANIZER'
    );

    await RideRepository.updateOrganizerParticipantId(ride.id, participant.id);

    const participantToken = crypto.randomUUID();

    return {
      rideId: ride.id,
      code: ride.code,
      status: ride.status,
      participantId: participant.id,
      participantToken,
      name: participant.name,
    };
  }

  static async joinRide(code: string, dto: JoinRideDto): Promise<JoinRideResponse> {
    const ride = await RideRepository.findByCode(code);
    if (!ride) {
      const err = new Error('Ride not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (ride.status === 'COMPLETED' || ride.status === 'CANCELLED') {
      const err = new Error(`Cannot join a ride that is ${ride.status.toLowerCase()}`);
      (err as any).statusCode = 400;
      throw err;
    }

    const participantName = dto.name.trim();
    if (!participantName) {
      const err = new Error('Participant name is required');
      (err as any).statusCode = 400;
      throw err;
    }

    const participant = await ParticipantRepository.createParticipant(
      ride.id,
      participantName,
      'RIDER'
    );

    const participantToken = crypto.randomUUID();

    return {
      participantId: participant.id,
      participantToken,
      rideId: ride.id,
      code: ride.code,
      name: participant.name,
    };
  }

  static async getRideByCode(code: string): Promise<GetRideResponse> {
    const ride = await RideRepository.findByCode(code);
    if (!ride) {
      const err = new Error('Ride not found');
      (err as any).statusCode = 404;
      throw err;
    }

    const participants = await ParticipantRepository.getParticipantsByRideId(ride.id);

    return {
      id: ride.id,
      code: ride.code,
      name: ride.name,
      status: ride.status,
      start: ride.start,
      destination: ride.destination,
      startedAt: ride.startedAt,
      endedAt: ride.endedAt,
      participants,
    };
  }

  static async leaveRide(code: string, participantId: string) {
    const ride = await RideRepository.findByCode(code);
    if (!ride) {
      const err = new Error('Ride not found');
      (err as any).statusCode = 404;
      throw err;
    }

    const updated = await ParticipantRepository.updateParticipantStatus(participantId, 'LEFT');
    return updated;
  }

  static async startRide(code: string, participantId: string): Promise<GetRideResponse> {
    const ride = await RideRepository.findByCode(code);
    if (!ride) {
      const err = new Error('Ride not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (ride.status !== 'WAITING') {
      const err = new Error(`Cannot start ride with status ${ride.status}`);
      (err as any).statusCode = 400;
      throw err;
    }

    const participant = await ParticipantRepository.findParticipantById(participantId);
    if (!participant || participant.rideId !== ride.id || participant.role !== 'ORGANIZER') {
      const err = new Error('Only the ride organizer can start the ride');
      (err as any).statusCode = 403;
      throw err;
    }

    await RideRepository.updateRideStatus(ride.id, 'ACTIVE');
    return await this.getRideByCode(code);
  }

  static async endRide(code: string, participantId: string): Promise<GetRideResponse> {
    const ride = await RideRepository.findByCode(code);
    if (!ride) {
      const err = new Error('Ride not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (ride.status !== 'ACTIVE') {
      const err = new Error(`Cannot end a ride that is not currently active (current status: ${ride.status})`);
      (err as any).statusCode = 400;
      throw err;
    }

    const participant = await ParticipantRepository.findParticipantById(participantId);
    if (!participant || participant.rideId !== ride.id || participant.role !== 'ORGANIZER') {
      const err = new Error('Only the ride organizer can end the ride');
      (err as any).statusCode = 403;
      throw err;
    }

    await RideRepository.updateRideStatus(ride.id, 'COMPLETED');
    return await this.getRideByCode(code);
  }

  static async getRideRoute(code: string) {
    const ride = await RideRepository.findByCode(code);
    if (!ride) {
      const err = new Error('Ride not found');
      (err as any).statusCode = 404;
      throw err;
    }

    return await routingService.getRoute(
      ride.start.latitude,
      ride.start.longitude,
      ride.destination.latitude,
      ride.destination.longitude
    );
  }
}
