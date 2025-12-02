import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Location as LocationType } from '../types';

const LOCATION_TASK_NAME = 'background-location-task';

export class LocationService {
  private static instance: LocationService;
  private locationCallback: ((location: LocationType) => void) | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request location permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.error('Foreground location permission not granted');
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      console.error('Background location permission not granted');
      return false;
    }

    return true;
  }

  /**
   * Check if location permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
    const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
    
    return foregroundStatus === 'granted' && backgroundStatus === 'granted';
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<LocationType | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: new Date(location.timestamp),
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Start tracking location in the background
   */
  async startTracking(callback: (location: LocationType) => void): Promise<boolean> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) return false;
      }

      this.locationCallback = callback;

      // Register background task
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // 30 seconds
        distanceInterval: 50, // 50 meters
        foregroundService: {
          notificationTitle: 'Stipator is tracking your trip',
          notificationBody: 'Your trusted contacts are receiving location updates',
          notificationColor: '#FF6B6B',
        },
      });

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  /**
   * Stop tracking location
   */
  async stopTracking(): Promise<void> {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
      this.locationCallback = null;
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }

  /**
   * Get the callback for location updates
   */
  getLocationCallback(): ((location: LocationType) => void) | null {
    return this.locationCallback;
  }
}

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const locationService = LocationService.getInstance();
    const callback = locationService.getLocationCallback();

    if (callback && locations.length > 0) {
      const lastLocation = locations[locations.length - 1];
      callback({
        lat: lastLocation.coords.latitude,
        lng: lastLocation.coords.longitude,
        accuracy: lastLocation.coords.accuracy || undefined,
        timestamp: new Date(lastLocation.timestamp),
      });
    }
  }
});

export default LocationService;
