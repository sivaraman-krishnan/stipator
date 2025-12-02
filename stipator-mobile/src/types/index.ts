// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  lastActive: Date;
}

// Trusted Contact Types
export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship?: string;
  isVerified: boolean;
  addedAt: Date;
}

// Location Types
export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: Date;
}

export interface LocationWithAddress extends Location {
  address: string;
}

// Trip Types
export enum TripStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Trip {
  id: string;
  userId: string;
  origin: LocationWithAddress;
  destination: LocationWithAddress;
  expectedRoute: Location[];
  status: TripStatus;
  startTime: Date;
  endTime?: Date;
  deviationDetected: boolean;
  lastLocationUpdate: Date;
}

// Alert Types
export interface Alert {
  id: string;
  tripId: string;
  type: 'DEVIATION' | 'PANIC' | 'START' | 'END';
  location: Location;
  timestamp: Date;
  sent: boolean;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  TrustedContacts: undefined;
  AddContact: undefined;
  StartTrip: undefined;
  ActiveTrip: { tripId: string };
  Profile: undefined;
};
