import { Request, Response, NextFunction } from 'express';
import { RideService } from './ride.service.js';
import { ParticipantRepository } from '../participants/participant.repository.js';
import { rideGateway } from '../../index.js';

export class RideController {
  static async createRide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await RideService.createRide(req.body);
      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async joinRide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const response = await RideService.joinRide(code, req.body);

      // Broadcast PARTICIPANT_JOINED event to all connected sockets in room
      const participant = await ParticipantRepository.findParticipantById(response.participantId);
      if (participant) {
        rideGateway.getIO().to(`ride:${code.toUpperCase()}`).emit('PARTICIPANT_JOINED', participant);
      }

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const response = await RideService.getRideByCode(code);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async leaveRide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const { participantId } = req.body;
      const response = await RideService.leaveRide(code, participantId);

      // Broadcast PARTICIPANT_LEFT event to all connected sockets in room
      rideGateway.getIO().to(`ride:${code.toUpperCase()}`).emit('PARTICIPANT_LEFT', { participantId });

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
}
