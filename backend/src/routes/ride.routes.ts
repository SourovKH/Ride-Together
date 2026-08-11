import { Router } from 'express';
import { z } from 'zod';
import { RideController } from '../modules/rides/ride.controller.js';
import { validateRequest } from '../middleware/validate.js';

const createRideSchema = z.object({
  name: z.string().min(2, 'Ride name must be at least 2 characters'),
  organizerName: z.string().min(1, 'Organizer name is required').optional(),
  start: z.object({
    name: z.string().min(1, 'Start location name is required'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  destination: z.object({
    name: z.string().min(1, 'Destination location name is required'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

const joinRideSchema = z.object({
  name: z.string().min(2, 'Participant name must be at least 2 characters'),
});

const actionRideSchema = z.object({
  participantId: z.string().uuid('Invalid participant ID'),
});

export const rideRouter = Router();

// POST /api/rides - Create a new ride
rideRouter.post('/', validateRequest(createRideSchema), RideController.createRide);

// GET /api/rides/:code - Get ride info and participant list
rideRouter.get('/:code', RideController.getRide);

// POST /api/rides/:code/join - Join ride
rideRouter.post('/:code/join', validateRequest(joinRideSchema), RideController.joinRide);

// POST /api/rides/:code/leave - Leave ride
rideRouter.post('/:code/leave', validateRequest(actionRideSchema), RideController.leaveRide);

// POST /api/rides/:code/start - Start ride (Organizer only)
rideRouter.post('/:code/start', validateRequest(actionRideSchema), RideController.startRide);

// POST /api/rides/:code/end - End ride (Organizer only)
rideRouter.post('/:code/end', validateRequest(actionRideSchema), RideController.endRide);

// GET /api/rides/:code/locations - Fetch live rider locations from Redis
rideRouter.get('/:code/locations', RideController.getLocations);



