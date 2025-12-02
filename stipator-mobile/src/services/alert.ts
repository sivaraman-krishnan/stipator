import { Location } from '../types';

export interface SMSAlert {
  to: string[];
  message: string;
  locationLink: string;
}

export class AlertService {
  private static instance: AlertService;
  private backendUrl: string;

  constructor() {
    // TODO: Replace with your backend URL (Firebase Functions or API endpoint)
    this.backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  }

  static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  /**
   * Generate Google Maps link from location
   */
  generateMapLink(location: Location): string {
    return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
  }

  /**
   * Send trip start alert to trusted contacts
   */
  async sendTripStartAlert(
    userName: string,
    destination: string,
    location: Location,
    contacts: string[]
  ): Promise<boolean> {
    try {
      const mapLink = this.generateMapLink(location);
      const message = `🚕 ${userName} started a trip to ${destination}. Track live: ${mapLink}`;

      return await this.sendSMS(contacts, message, location);
    } catch (error) {
      console.error('Error sending trip start alert:', error);
      return false;
    }
  }

  /**
   * Send route deviation alert to trusted contacts
   */
  async sendDeviationAlert(
    userName: string,
    location: Location,
    contacts: string[]
  ): Promise<boolean> {
    try {
      const mapLink = this.generateMapLink(location);
      const message = `⚠️ ROUTE DEVIATION: ${userName} deviated from the expected route. Current location: ${mapLink}`;

      return await this.sendSMS(contacts, message, location);
    } catch (error) {
      console.error('Error sending deviation alert:', error);
      return false;
    }
  }

  /**
   * Send periodic location update to trusted contacts
   */
  async sendLocationUpdate(
    userName: string,
    location: Location,
    contacts: string[]
  ): Promise<boolean> {
    try {
      const mapLink = this.generateMapLink(location);
      const timestamp = new Date().toLocaleTimeString();
      const message = `📍 ${userName} location update (${timestamp}): ${mapLink}`;

      return await this.sendSMS(contacts, message, location);
    } catch (error) {
      console.error('Error sending location update:', error);
      return false;
    }
  }

  /**
   * Send trip completion alert to trusted contacts
   */
  async sendTripEndAlert(
    userName: string,
    location: Location,
    contacts: string[]
  ): Promise<boolean> {
    try {
      const mapLink = this.generateMapLink(location);
      const message = `✅ ${userName} reached destination safely. Final location: ${mapLink}`;

      return await this.sendSMS(contacts, message, location);
    } catch (error) {
      console.error('Error sending trip end alert:', error);
      return false;
    }
  }

  /**
   * Send panic/emergency alert to trusted contacts
   */
  async sendPanicAlert(
    userName: string,
    location: Location,
    contacts: string[]
  ): Promise<boolean> {
    try {
      const mapLink = this.generateMapLink(location);
      const message = `🚨 EMERGENCY: ${userName} triggered panic alert! Current location: ${mapLink}`;

      return await this.sendSMS(contacts, message, location);
    } catch (error) {
      console.error('Error sending panic alert:', error);
      return false;
    }
  }

  /**
   * Send SMS via backend API (Twilio integration)
   */
  private async sendSMS(
    contacts: string[],
    message: string,
    location: Location
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: contacts,
          message,
          location: {
            lat: location.lat,
            lng: location.lng,
          },
        }),
      });

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Error calling SMS API:', error);
      return false;
    }
  }
}

export default AlertService;
