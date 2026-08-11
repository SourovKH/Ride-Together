import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env.js';
import { ParticipantRepository } from '../modules/participants/participant.repository.js';
import { LocationRepository, LocationPayload } from '../modules/locations/location.repository.js';

export class RideGateway {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: env.CORS_ORIGIN,
        credentials: true,
      },
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`⚡ Socket connected: ${socket.id}`);

      // Client joins a ride room
      socket.on('JOIN_RIDE', async (data: { code: string; participantId?: string }) => {
        try {
          const { code, participantId } = data;
          if (!code) return;

          const roomName = `ride:${code.toUpperCase()}`;
          await socket.join(roomName);
          console.log(`⚡ Socket ${socket.id} joined room ${roomName}`);

          // Send current active Redis location fleet to the newly joined socket
          const existingLocations = await LocationRepository.getRideLocations(code);
          socket.emit('INITIAL_LOCATIONS', existingLocations);

          if (participantId) {
            const participant = await ParticipantRepository.findParticipantById(participantId);
            if (participant) {
              // Notify all other sockets in this ride room
              this.io.to(roomName).emit('PARTICIPANT_JOINED', participant);
              console.log(`👤 Participant ${participant.name} (${participantId}) joined socket room ${roomName}`);
            }
          }
        } catch (err) {
          console.error('Error handling JOIN_RIDE socket event:', err);
        }
      });

      // Client broadcasts live location update
      socket.on('LOCATION_UPDATE', async (data: LocationPayload & { code: string }) => {
        try {
          const { code, participantId, latitude, longitude, accuracy, heading, speed, timestamp } = data;
          if (!code || !participantId) return;

          // Coordinate bounds validation
          if (
            typeof latitude !== 'number' ||
            typeof longitude !== 'number' ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
          ) {
            return;
          }

          const payload: LocationPayload = {
            participantId,
            latitude,
            longitude,
            accuracy: accuracy || 0,
            heading: heading ?? null,
            speed: speed ?? null,
            timestamp: timestamp || Date.now(),
          };

          const roomName = `ride:${code.toUpperCase()}`;

          console.log(
            `📍 [LOCATION_UPDATE] Code: ${code.toUpperCase()} | Participant: ${participantId} | Lat: ${latitude.toFixed(
              6
            )}, Lng: ${longitude.toFixed(6)} | Speed: ${speed ?? 0} km/h (±${accuracy}m)`
          );

          // Save to Redis cache
          await LocationRepository.saveParticipantLocation(code, payload);

          // Broadcast LOCATION_UPDATED to all connected clients in the ride room
          this.io.to(roomName).emit('LOCATION_UPDATED', payload);
        } catch (err) {
          console.error('Error handling LOCATION_UPDATE socket event:', err);
        }
      });

      // Client leaves a ride room
      socket.on('LEAVE_RIDE', async (data: { code: string; participantId?: string }) => {
        try {
          const { code, participantId } = data;
          if (!code) return;

          const roomName = `ride:${code.toUpperCase()}`;
          if (participantId) {
            await ParticipantRepository.updateParticipantStatus(participantId, 'LEFT');
            await LocationRepository.removeParticipantLocation(code, participantId);
            this.io.to(roomName).emit('PARTICIPANT_LEFT', { participantId });
          }
          await socket.leave(roomName);
          console.log(`👋 Socket ${socket.id} left room ${roomName}`);
        } catch (err) {
          console.error('Error handling LEAVE_RIDE socket event:', err);
        }
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      });
    });
  }

  public getIO(): Server {
    return this.io;
  }
}
