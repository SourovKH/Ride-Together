import { create } from 'zustand';
import { api, CreateRidePayload, JoinRidePayload, RideDetails } from '../services/api';

interface RideSession {
  participantId: string;
  participantToken: string;
  participantName: string;
  role: 'ORGANIZER' | 'RIDER';
  rideCode: string;
}

interface RideState {
  currentRide: RideDetails | null;
  session: RideSession | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRide: (code: string) => Promise<RideDetails | null>;
  createRide: (payload: CreateRidePayload) => Promise<string>;
  joinRide: (code: string, payload: JoinRidePayload) => Promise<string>;
  clearSession: () => void;
  clearError: () => void;
}

const SESSION_STORAGE_KEY = 'ridetogether_session';

const getInitialSession = (): RideSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useRideStore = create<RideState>((set) => ({
  currentRide: null,
  session: getInitialSession(),
  isLoading: false,
  error: null,

  fetchRide: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const ride = await api.getRideByCode(code);
      set({ currentRide: ride, isLoading: false });
      return ride;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch ride details', isLoading: false });
      return null;
    }
  },

  createRide: async (payload: CreateRidePayload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.createRide(payload);
      const session: RideSession = {
        participantId: data.participantId,
        participantToken: data.participantToken,
        participantName: data.name,
        role: 'ORGANIZER',
        rideCode: data.code,
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

      // Fetch full ride details to update store
      const ride = await api.getRideByCode(data.code);
      set({
        currentRide: ride,
        session,
        isLoading: false,
      });

      return data.code;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create ride', isLoading: false });
      throw err;
    }
  },

  joinRide: async (code: string, payload: JoinRidePayload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.joinRide(code, payload);
      const session: RideSession = {
        participantId: data.participantId,
        participantToken: data.participantToken,
        participantName: data.name,
        role: 'RIDER',
        rideCode: data.code,
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

      // Fetch full ride details
      const ride = await api.getRideByCode(data.code);
      set({
        currentRide: ride,
        session,
        isLoading: false,
      });

      return data.code;
    } catch (err: any) {
      set({ error: err.message || 'Failed to join ride', isLoading: false });
      throw err;
    }
  },

  clearSession: () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    set({ session: null, currentRide: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
