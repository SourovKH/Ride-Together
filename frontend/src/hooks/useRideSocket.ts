import { useEffect, useRef, useState } from 'react';
import { socketService } from '../services/socket';
import { useRideStore } from '../store/useRideStore';
import { LocationData } from './useGeolocation';

export const useRideSocket = (
  code?: string,
  participantId?: string,
  location?: LocationData | null
) => {
  const [isConnected, setIsConnected] = useState(false);
  const {
    addParticipant,
    removeParticipant,
    updateRideStatus,
    fetchRide,
    updateParticipantLocation,
    setParticipantLocations,
    fetchRideLocations,
    currentRide,
  } = useRideStore();

  const lastEmitTimeRef = useRef<number>(0);
  const EMIT_THROTTLE_MS = 3000; // Throttle to max 1 emit every 3 seconds

  useEffect(() => {
    if (!code) {
      setIsConnected(false);
      return;
    }

    // Connect socket and join ride room
    socketService.joinRideRoom(code, participantId);

    // Initial fetch of active locations
    fetchRideLocations(code);

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

    // Listen for real-time location events
    socketService.onInitialLocations((locations) => {
      console.log('⚡ [INITIAL_LOCATIONS] Received fleet locations snapshot:', locations);
      setParticipantLocations(locations);
    });

    socketService.onLocationUpdated((locData) => {
      console.log(
        `📍 [LOCATION_UPDATED] Rider ${locData.participantId}: Lat ${locData.latitude.toFixed(
          6
        )}, Lng ${locData.longitude.toFixed(6)} | Speed: ${locData.speed} km/h (±${locData.accuracy}m)`
      );
      updateParticipantLocation(locData);
    });

    return () => {
      // Unsubscribe socket from room without altering DB status
      socketService.leaveRideRoom(code);
    };
  }, [
    code,
    participantId,
    addParticipant,
    removeParticipant,
    updateRideStatus,
    fetchRide,
    updateParticipantLocation,
    setParticipantLocations,
    fetchRideLocations,
  ]);

  // Throttled location emitter when current position changes and ride is ACTIVE
  useEffect(() => {
    if (!code || !participantId || !location || currentRide?.status !== 'ACTIVE') {
      return;
    }

    const now = Date.now();
    if (now - lastEmitTimeRef.current >= EMIT_THROTTLE_MS) {
      lastEmitTimeRef.current = now;
      console.log(
        `📡 [LOCATION_UPDATE Outgoing] Code: ${code} | Lat ${location.latitude.toFixed(
          6
        )}, Lng ${location.longitude.toFixed(6)} | Speed: ${location.speed} km/h (±${location.accuracy}m)`
      );
      socketService.emitLocationUpdate({
        code,
        participantId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        heading: location.heading,
        speed: location.speed,
        timestamp: location.timestamp,
      });
    }
  }, [code, participantId, location, currentRide?.status]);

  return { isConnected };
};
