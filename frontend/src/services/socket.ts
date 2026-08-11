import { io, Socket } from 'socket.io-client';
import { Participant } from './api';

class SocketService {
  private socket: Socket | null = null;

  public connect(): Socket {
    if (!this.socket) {
      // Connects to window.location.origin (e.g. http://localhost:5173),
      // which proxies /socket.io to http://localhost:5001 as configured in vite.config.ts
      this.socket = io({
        path: '/socket.io',
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Connected to WebSocket server');
      });

      this.socket.on('disconnect', (reason) => {
        console.log(`🔌 Disconnected from WebSocket server: ${reason}`);
      });
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public joinRideRoom(code: string, participantId?: string) {
    const socket = this.connect();
    const emitJoin = () => {
      console.log(`⚡ Emitting JOIN_RIDE for code: ${code}, participantId: ${participantId}`);
      socket.emit('JOIN_RIDE', { code, participantId });
    };

    if (socket.connected) {
      emitJoin();
    } else {
      socket.once('connect', emitJoin);
    }
  }

  public leaveRideRoom(code: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('LEAVE_RIDE', { code });
    }
  }

  public onParticipantJoined(callback: (participant: Participant) => void) {
    const socket = this.connect();
    socket.off('PARTICIPANT_JOINED');
    socket.on('PARTICIPANT_JOINED', callback);
  }

  public onParticipantLeft(callback: (data: { participantId: string }) => void) {
    const socket = this.connect();
    socket.off('PARTICIPANT_LEFT');
    socket.on('PARTICIPANT_LEFT', callback);
  }

  public onRideStarted(callback: (data: { code: string; status: 'ACTIVE'; startedAt?: string }) => void) {
    const socket = this.connect();
    socket.off('RIDE_STARTED');
    socket.on('RIDE_STARTED', callback);
  }

  public onRideEnded(callback: (data: { code: string; status: 'COMPLETED'; endedAt?: string }) => void) {
    const socket = this.connect();
    socket.off('RIDE_ENDED');
    socket.on('RIDE_ENDED', callback);
  }

  public onStatusChange(callback: (connected: boolean) => void) {
    const socket = this.connect();
    socket.on('connect', () => callback(true));
    socket.on('disconnect', () => callback(false));
    callback(socket.connected);
  }
}

export const socketService = new SocketService();
