import { useEffect, useState } from 'react';
import { socketService } from '../services/socket';
import { useRideStore } from '../store/useRideStore';

export const useRideSocket = (code?: string, participantId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const { addParticipant, removeParticipant } = useRideStore();

  useEffect(() => {
    if (!code) {
      setIsConnected(false);
      return;
    }

    // Connect socket and join ride room
    socketService.joinRideRoom(code, participantId);

    // Track status
    socketService.onStatusChange((connected) => {
      setIsConnected(connected);
    });

    // Listen for real-time participant events
    socketService.onParticipantJoined((participant) => {
      console.log('⚡ Real-time Event: PARTICIPANT_JOINED', participant);
      addParticipant(participant);
    });

    socketService.onParticipantLeft((data) => {
      console.log('⚡ Real-time Event: PARTICIPANT_LEFT', data);
      removeParticipant(data.participantId);
    });

    return () => {
      // Unsubscribe socket from room without altering DB status
      socketService.leaveRideRoom(code);
    };
  }, [code, participantId, addParticipant, removeParticipant]);

  return { isConnected };
};
