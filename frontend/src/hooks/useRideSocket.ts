import { useEffect, useState } from 'react';
import { socketService } from '../services/socket';
import { useRideStore } from '../store/useRideStore';

export const useRideSocket = (code?: string, participantId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const { addParticipant, removeParticipant, updateRideStatus, fetchRide } = useRideStore();

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

    // Listen for ride status events
    socketService.onRideStarted((data) => {
      console.log('⚡ Real-time Event: RIDE_STARTED', data);
      updateRideStatus('ACTIVE');
      fetchRide(code);
    });

    socketService.onRideEnded((data) => {
      console.log('⚡ Real-time Event: RIDE_ENDED', data);
      updateRideStatus('COMPLETED');
      fetchRide(code);
    });

    return () => {
      // Unsubscribe socket from room without altering DB status
      socketService.leaveRideRoom(code);
    };
  }, [code, participantId, addParticipant, removeParticipant, updateRideStatus, fetchRide]);

  return { isConnected };
};
