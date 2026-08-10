import { Request, Response, NextFunction } from 'express';
import { RideService } from './ride.service.js';

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
}
