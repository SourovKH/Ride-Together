export interface RideLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export type RideStatus = 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type ParticipantRole = 'ORGANIZER' | 'RIDER';
export type ParticipantStatus = 'JOINED' | 'LEFT' | 'REMOVED';

export interface Ride {
  id: string;
  code: string;
  name: string;
  start: RideLocation;
  destination: RideLocation;
  status: RideStatus;
  organizerParticipantId?: string | null;
  createdAt: string;
  startedAt?: string | null;
  endedAt?: string | null;
}

export interface Participant {
  id: string;
  rideId: string;
  name: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joinedAt: string;
}

export interface CreateRideDto {
  name: string;
  organizerName?: string;
  start: RideLocation;
  destination: RideLocation;
}

export interface JoinRideDto {
  name: string;
}

export interface CreateRideResponse {
  rideId: string;
  code: string;
  status: RideStatus;
  participantId: string;
  participantToken: string;
  name: string;
}

export interface JoinRideResponse {
  participantId: string;
  participantToken: string;
  rideId: string;
  code: string;
  name: string;
}

export interface GetRideResponse {
  id: string;
  code: string;
  name: string;
  status: RideStatus;
  start: RideLocation;
  destination: RideLocation;
  participants: Participant[];
}
