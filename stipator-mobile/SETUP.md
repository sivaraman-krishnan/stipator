# Stipator Mobile - Setup Guide

## Prerequisites

- Node.js 20.19.4+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio/Emulator
- Firebase account
- Google Cloud Platform account (for Maps API)
- Twilio account

## Setup Steps

### 1. Install Dependencies

```bash
cd stipator-mobile
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "Stipator"
3. Enable Authentication > Sign-in method > Email/Password
4. Create Firestore Database in production mode
5. Get your Firebase config:
   - Project Settings > General > Your apps > Web app
   - Copy the configuration values

6. Initialize Firebase Functions:
```bash
cd functions
npm install
```

### 3. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the following APIs:
   - Maps SDK for iOS
   - Maps SDK for Android
   - Directions API
   - Geocoding API
   - Places API
4. Create API credentials (API Key)
5. Restrict the API key to your app (optional but recommended)

### 4. Twilio Setup

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for an account
3. Get a phone number with SMS capabilities
4. Copy your Account SID and Auth Token from the dashboard

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in all the values in `.env` with your actual credentials

3. Configure Firebase Functions environment:
```bash
cd functions
firebase functions:config:set twilio.account_sid="YOUR_ACCOUNT_SID"
firebase functions:config:set twilio.auth_token="YOUR_AUTH_TOKEN"
firebase functions:config:set twilio.phone_number="YOUR_TWILIO_NUMBER"
```

### 6. Deploy Firebase Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

After deployment, update `.env` with your Functions URL:
```
EXPO_PUBLIC_BACKEND_URL=https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net
```

### 7. Configure app.json

Update `stipator-mobile/app.json` to include Google Maps API key:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      },
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "This app needs your location to track your trip and keep you safe.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "This app needs your location in the background to monitor your trip and send alerts to trusted contacts.",
        "UIBackgroundModes": ["location"]
      }
    }
  }
}
```

### 8. Run the App

**Development mode:**
```bash
npm start
```

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Web (limited functionality):**
```bash
npm run web
```

## Firestore Database Structure

Create the following collections in Firestore:

### users
```
users/{userId}
  - name: string
  - email: string
  - phone: string
  - createdAt: timestamp
  - lastActive: timestamp
```

### trusted_contacts
```
trusted_contacts/{contactId}
  - userId: string
  - name: string
  - phone: string
  - relationship: string (optional)
  - isVerified: boolean
  - addedAt: timestamp
```

### trips
```
trips/{tripId}
  - userId: string
  - origin: {lat, lng, address}
  - destination: {lat, lng, address}
  - expectedRoute: array of {lat, lng}
  - status: string (ACTIVE, COMPLETED, CANCELLED)
  - startTime: timestamp
  - endTime: timestamp (optional)
  - deviationDetected: boolean
  - lastLocationUpdate: timestamp
```

### sms_logs
```
sms_logs/{logId}
  - recipients: array of strings
  - message: string
  - location: {lat, lng}
  - timestamp: timestamp
  - successes: number
  - failures: number
```

## Firestore Security Rules

Add these rules in Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can manage their own trusted contacts
    match /trusted_contacts/{contactId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                     request.resource.data.userId == request.auth.uid;
    }
    
    // Users can manage their own trips
    match /trips/{tripId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                     request.resource.data.userId == request.auth.uid;
    }
    
    // SMS logs are server-only
    match /sms_logs/{logId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

## Testing

1. Register a new account
2. Add at least one trusted contact (use your own phone number for testing)
3. Start a trip with a real destination
4. Walk around to test location tracking
5. Check that SMS messages are received

## Troubleshooting

### Location not updating
- Make sure location permissions are granted
- Check that background location is enabled
- Ensure the app is not being killed by battery optimization

### SMS not sending
- Verify Twilio credentials are correct
- Check Firebase Functions logs: `firebase functions:log`
- Ensure Twilio account has sufficient balance
- Verify phone numbers include country code

### Maps not showing
- Verify Google Maps API key is correct
- Ensure required APIs are enabled in Google Cloud Console
- Check API key restrictions

## Production Deployment

Before deploying to production:

1. Enable Firestore security rules
2. Restrict API keys to your app bundle IDs
3. Set up proper error logging (Sentry, Firebase Crashlytics)
4. Test thoroughly on real devices
5. Submit to App Store and Google Play Store

## Cost Estimates (Monthly)

- **Firebase**: Free tier covers development, ~$25-50/month for 1000+ users
- **Google Maps API**: $200 free credit, ~$5-20/month for moderate usage
- **Twilio SMS**: $0.0075 per SMS, ~$50-100/month for 1000 active trips

## Support

For issues, please check:
- Firebase Console for authentication/database errors
- Google Cloud Console for Maps API issues
- Twilio Console for SMS delivery status
- Firebase Functions logs for backend errors

---

**Built with ❤️ for safety**
