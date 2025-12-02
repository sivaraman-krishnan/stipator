# Stipator - Quick Start Guide

## 🎯 Goal
Get the app running on your device in 30 minutes.

## Step 1: Install Dependencies (5 min)

```bash
cd stipator-mobile
npm install
cd functions
npm install
cd ..
```

## Step 2: Firebase Setup (10 min)

### 2.1 Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "Stipator"
4. Disable Google Analytics (optional)

### 2.2 Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Click **Sign-in method** tab
4. Enable **Email/Password**

### 2.3 Create Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **test mode** (we'll add security rules later)
4. Choose a location near you

### 2.4 Get Firebase Config
1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web** icon (</>)
4. Register app with nickname "Stipator Web"
5. Copy the config object

### 2.5 Initialize Firebase Functions
```bash
cd functions
npm install -g firebase-tools
firebase login
firebase init functions
# Select your Stipator project
# Choose TypeScript
# Use existing code (say No to overwrite)
```

## Step 3: Google Maps API (5 min)

### 3.1 Enable APIs
1. Go to https://console.cloud.google.com/
2. Select your project (or create new)
3. Go to **APIs & Services > Library**
4. Enable these APIs:
   - Maps SDK for iOS
   - Maps SDK for Android  
   - Directions API
   - Geocoding API
   - Places API

### 3.2 Create API Key
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy the key (we'll restrict it later)

## Step 4: Twilio Setup (5 min)

1. Go to https://www.twilio.com/try-twilio
2. Sign up for free trial account
3. Get a phone number with SMS capability
4. Note your **Account SID**, **Auth Token**, and **Phone Number** from dashboard

## Step 5: Configure Environment (3 min)

### 5.1 Mobile App Config
```bash
cd stipator-mobile
cp .env.example .env
```

Edit `.env` and fill in:
```bash
# From Firebase config
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=stipator-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=stipator-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=stipator-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx

# From Google Cloud Console
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# Will be updated after deploying functions
EXPO_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 5.2 Update app.json
Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in `app.json` with your actual key (2 places: iOS and Android).

### 5.3 Functions Config
```bash
cd functions
firebase functions:config:set twilio.account_sid="ACxxxxx"
firebase functions:config:set twilio.auth_token="your_token"
firebase functions:config:set twilio.phone_number="+1234567890"
```

## Step 6: Deploy Functions (2 min)

```bash
cd functions
npm run build
firebase deploy --only functions
```

After deployment, copy the function URL from output:
```
✔  functions[sendSMS]: Successful create operation.
Function URL: https://us-central1-stipator-xxxxx.cloudfunctions.net/sendSMS
```

Update `.env`:
```bash
EXPO_PUBLIC_BACKEND_URL=https://us-central1-stipator-xxxxx.cloudfunctions.net
```

## Step 7: Run the App! (30 sec)

```bash
cd stipator-mobile
npm start
```

- Press `i` for iOS simulator (Mac only)
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## 🎉 You're Ready!

### Test the App:
1. **Register** a new account
2. **Add a trusted contact** (use your own phone number)
3. **Start a trip** with a nearby destination
4. Check your phone for SMS alerts!

## 🐛 Troubleshooting

### App won't start
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Location not working
- Grant location permissions when prompted
- On iOS: Settings > Privacy > Location Services
- On Android: Settings > Apps > Permissions

### SMS not sending
- Check Twilio console for errors
- View Firebase logs: `firebase functions:log`
- Verify phone number format: `+1234567890`

### Maps not showing
- Verify API key is correct in both `.env` and `app.json`
- Check Google Cloud Console that APIs are enabled
- May need to wait 5-10 minutes for API key to activate

## 📚 Next Steps

- Read [SETUP.md](SETUP.md) for detailed configuration
- Read [REQUIREMENTS.md](REQUIREMENTS.md) for feature details
- Check [README.md](README.md) for project overview

## 💡 Pro Tips

1. **Use Test Mode First**: Start with Firestore in test mode, add security rules later
2. **Test SMS Costs**: Use your own phone number initially to avoid surprise costs
3. **API Quotas**: Google Maps free tier includes $200/month credit
4. **Development**: Use Expo Go app on your phone for fastest testing
5. **Production**: Build standalone apps only when features are complete

## ❓ Need Help?

- Check Firebase logs: `firebase functions:log`
- Check app logs: React Native debugger (Cmd+D on iOS, Cmd+M on Android)
- Review SETUP.md for detailed instructions
- Create an issue on GitHub

---

**Happy Coding! Stay Safe! 🚕**
