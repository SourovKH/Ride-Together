import { create } from 'zustand';
import { api, HealthResponse } from '../services/api';

interface AppState {
  healthStatus: HealthResponse | null;
  isCheckingHealth: boolean;
  healthError: string | null;
  fetchHealth: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  healthStatus: null,
  isCheckingHealth: false,
  healthError: null,

  fetchHealth: async () => {
    set({ isCheckingHealth: true, healthError: null });
    try {
      const health = await api.getHealth();
      set({ healthStatus: health, isCheckingHealth: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to server';
      set({ healthError: message, isCheckingHealth: false });
    }
  },
}));
