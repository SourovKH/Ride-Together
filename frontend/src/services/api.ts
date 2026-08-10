const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface LocationInput {
  name: string;
  latitude: number;
  longitude: number;
}

export interface CreateRidePayload {
  name: string;
  organizerName?: string;
  start: LocationInput;
  destination: LocationInput;
}

export interface JoinRidePayload {
  name: string;
}

export interface Participant {
  id: string;
  rideId: string;
  name: string;
  role: 'ORGANIZER' | 'RIDER';
  status: 'JOINED' | 'LEFT' | 'REMOVED';
  joinedAt: string;
}

export interface RideDetails {
  id: string;
  code: string;
  name: string;
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  start: LocationInput;
  destination: LocationInput;
  participants: Participant[];
}

export interface CreateRideResponseData {
  rideId: string;
  code: string;
  status: string;
  participantId: string;
  participantToken: string;
  name: string;
}

export interface JoinRideResponseData {
  participantId: string;
  participantToken: string;
  rideId: string;
  code: string;
  name: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    postgres: boolean;
    redis: boolean;
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || 'API request failed');
  }
  return json.data as T;
}

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE_URL}/health`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Health check failed');
    return json as HealthResponse;
  },

  async createRide(payload: CreateRidePayload): Promise<CreateRideResponseData> {
    const res = await fetch(`${API_BASE_URL}/rides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<CreateRideResponseData>(res);
  },

  async getRideByCode(code: string): Promise<RideDetails> {
    const res = await fetch(`${API_BASE_URL}/rides/${encodeURIComponent(code)}`);
    return handleResponse<RideDetails>(res);
  },

  async joinRide(code: string, payload: JoinRidePayload): Promise<JoinRideResponseData> {
    const res = await fetch(`${API_BASE_URL}/rides/${encodeURIComponent(code)}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<JoinRideResponseData>(res);
  },

  async leaveRide(code: string, participantId: string): Promise<Participant> {
    const res = await fetch(`${API_BASE_URL}/rides/${encodeURIComponent(code)}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId }),
    });
    return handleResponse<Participant>(res);
  },
};
