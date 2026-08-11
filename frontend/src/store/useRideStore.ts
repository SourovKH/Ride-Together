import { create } from 'zustand';
import { api, CreateRidePayload, JoinRidePayload, Participant, RideDetails } from '../services/api';

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
  leaveRide: (code: string, participantId: string) => Promise<void>;
  startRide: (code: string, participantId: string) => Promise<void>;
  endRide: (code: string, participantId: string) => Promise<void>;
  updateRideStatus: (status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED') => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
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

  leaveRide: async (code: string, participantId: string) => {
    try {
      await api.leaveRide(code, participantId);
    } catch (err: any) {
      console.error('Error leaving ride REST:', err);
    } finally {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      set({ session: null, currentRide: null });
    }
  },

  startRide: async (code: string, participantId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRide = await api.startRide(code, participantId);
      set((state) => ({
        currentRide: state.currentRide
          ? {
              ...state.currentRide,
              ...updatedRide,
              participants: updatedRide.participants || state.currentRide.participants || [],
            }
          : updatedRide,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to start ride', isLoading: false });
      throw err;
    }
  },

  endRide: async (code: string, participantId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRide = await api.endRide(code, participantId);
      set((state) => ({
        currentRide: state.currentRide
          ? {
              ...state.currentRide,
              ...updatedRide,
              participants: updatedRide.participants || state.currentRide.participants || [],
            }
          : updatedRide,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to end ride', isLoading: false });
      throw err;
    }
  },

  updateRideStatus: (status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED') => {
    set((state) => {
      if (!state.currentRide) return state;
      return {
        currentRide: {
          ...state.currentRide,
          status,
          participants: state.currentRide.participants || [],
        },
      };
    });
  },

  addParticipant: (participant: Participant) => {
    set((state) => {
      if (!state.currentRide) return state;
      const currentList = state.currentRide.participants || [];
      const exists = currentList.some((p) => p.id === participant.id);
      const updatedParticipants = exists
        ? currentList.map((p) => (p.id === participant.id ? participant : p))
        : [...currentList, participant];

      return {
        currentRide: {
          ...state.currentRide,
          participants: updatedParticipants,
        },
      };
    });
  },

  removeParticipant: (participantId: string) => {
    set((state) => {
      if (!state.currentRide) return state;
      const currentList = state.currentRide.participants || [];
      return {
        currentRide: {
          ...state.currentRide,
          participants: currentList.filter((p) => p.id !== participantId),
        },
      };
    });
  },

  clearSession: () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    set({ session: null, currentRide: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
