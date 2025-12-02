import { Location } from '../types';

export class RouteService {
  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in meters
   */
  static calculateDistance(point1: Location, point2: Location): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Find the closest point on the expected route to the current location
   */
  static findClosestPointOnRoute(
    currentLocation: Location,
    expectedRoute: Location[]
  ): { point: Location; distance: number; index: number } {
    let minDistance = Infinity;
    let closestPoint = expectedRoute[0];
    let closestIndex = 0;

    expectedRoute.forEach((point, index) => {
      const distance = this.calculateDistance(currentLocation, point);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
        closestIndex = index;
      }
    });

    return {
      point: closestPoint,
      distance: minDistance,
      index: closestIndex,
    };
  }

  /**
   * Check if current location deviates from expected route
   * Returns true if deviation exceeds threshold (default 500 meters)
   */
  static isDeviating(
    currentLocation: Location,
    expectedRoute: Location[],
    thresholdMeters: number = 500
  ): boolean {
    if (expectedRoute.length === 0) return false;

    const { distance } = this.findClosestPointOnRoute(currentLocation, expectedRoute);
    return distance > thresholdMeters;
  }

  /**
   * Get route directions from Google Maps Directions API
   */
  static async getDirections(
    origin: Location,
    destination: Location,
    apiKey: string
  ): Promise<Location[]> {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Directions API error:', data.status);
        return [];
      }

      const route = data.routes[0];
      if (!route) return [];

      // Extract route points from polyline
      const points: Location[] = [];
      route.legs[0].steps.forEach((step: any) => {
        const decoded = this.decodePolyline(step.polyline.points);
        points.push(...decoded);
      });

      return points;
    } catch (error) {
      console.error('Error getting directions:', error);
      return [];
    }
  }

  /**
   * Decode Google Maps polyline string to coordinates
   */
  static decodePolyline(encoded: string): Location[] {
    const points: Location[] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        lat: lat / 1e5,
        lng: lng / 1e5,
      });
    }

    return points;
  }

  /**
   * Get address from coordinates using Google Geocoding API
   */
  static async getAddress(location: Location, apiKey: string): Promise<string> {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      }

      return 'Unknown location';
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Unknown location';
    }
  }
}

export default RouteService;
