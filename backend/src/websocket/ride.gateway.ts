import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env.js';
import { ParticipantRepository } from '../modules/participants/participant.repository.js';

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
      socket.on('JOIN_RIDE', async (data: { code: string; participantId: string }) => {
        try {
          const { code, participantId } = data;
          if (!code || !participantId) return;

          const roomName = `ride:${code.toUpperCase()}`;
          await socket.join(roomName);

          const participant = await ParticipantRepository.findParticipantById(participantId);
          if (participant) {
            // Notify all other sockets in this ride room
            this.io.to(roomName).emit('PARTICIPANT_JOINED', participant);
            console.log(`👤 Participant ${participant.name} (${participantId}) joined socket room ${roomName}`);
          }
        } catch (err) {
          console.error('Error handling JOIN_RIDE socket event:', err);
        }
      });

      // Client leaves a ride room
      socket.on('LEAVE_RIDE', async (data: { code: string; participantId: string }) => {
        try {
          const { code, participantId } = data;
          if (!code || !participantId) return;

          const roomName = `ride:${code.toUpperCase()}`;
          await ParticipantRepository.updateParticipantStatus(participantId, 'LEFT');

          this.io.to(roomName).emit('PARTICIPANT_LEFT', { participantId });
          await socket.leave(roomName);
          console.log(`👋 Participant (${participantId}) left socket room ${roomName}`);
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
