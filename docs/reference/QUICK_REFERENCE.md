# Stipator - Quick Reference Card

## 🚀 Firebase Backend Status: ✅ OPERATIONAL

### Project Information
- **Project ID**: `stipator-43658`
- **Project Name**: Stipator
- **Console URL**: https://console.firebase.google.com/project/stipator-43658/overview
- **Billing Plan**: Blaze (pay-as-you-go)
- **Region**: us-central1

---

## 🔑 Firebase Credentials (Configured in .env)

```
API Key:          AIzaSyDZlBGTSN6b33qzm_C0SsbLReKgNZXxoV8
Auth Domain:      stipator-43658.firebaseapp.com
Project ID:       stipator-43658
Storage Bucket:   stipator-43658.firebasestorage.app
Messaging ID:     17195603580
App ID:           1:17195603580:web:77994ba902e06373b09bf9
```

---

## 🔧 Cloud Functions (Deployed)

| Function | URL |
|----------|-----|
| sendSMS | https://us-central1-stipator-43658.cloudfunctions.net/sendSMS |
| sendLocationUpdate | (callable from app) |
| checkStaleTrips | (scheduled, runs automatically) |

---

## ⚡ Quick Commands

### Start the App
```bash
cd c:\stipator\stipator-mobile
npm start
# Then: Press 'a' for Android, 'i' for iOS, 'w' for web
```

### Firebase Commands
```bash
# List deployed functions
firebase functions:list

# View function logs
firebase functions:log

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Check current project
firebase projects:list
```

### Useful npm Commands
```bash
# Install dependencies
npm install

# Clean install
rm -rf node_modules && npm install

# Check for outdated packages
npm outdated
```

---

## ✅ What's Working

- ✅ User authentication (register/login)
- ✅ User profile management
- ✅ Trusted contacts CRUD operations
- ✅ Firestore database operations
- ✅ Cloud Functions deployment
- ✅ Security rules enforcement

---

## ⚠️ What's Needed

### Google Maps API (REQUIRED)
**Get it from**: https://console.cloud.google.com/
**Enable**:
- Maps SDK for iOS
- Maps SDK for Android
- Directions API
- Geocoding API
- Places API

**Update .env**:
```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### Twilio (OPTIONAL for SMS)
**Get it from**: https://www.twilio.com/try-twilio
**Update .env**:
```bash
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```
**Then configure functions**:
```bash
firebase functions:config:set twilio.account_sid="YOUR_SID"
firebase functions:config:set twilio.auth_token="YOUR_TOKEN"
firebase functions:config:set twilio.phone_number="YOUR_NUMBER"
firebase deploy --only functions
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables (Firebase, Maps, Twilio) |
| `firebase.json` | Firebase project configuration |
| `firestore.rules` | Database security rules |
| `functions/src/index.ts` | Cloud Functions code |
| `src/services/firebase.ts` | Firebase SDK initialization |

---

## 🆘 Troubleshooting

### App won't start
```bash
cd c:\stipator\stipator-mobile
rm -rf node_modules
npm install
npm start
```

### Functions won't deploy
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### Firebase connection issues
```bash
firebase logout
firebase login
firebase use stipator-43658
```

### Environment variables not loading
- Make sure `.env` file is in `stipator-mobile/` directory
- Restart the Expo dev server (`npm start`)
- Variables must start with `EXPO_PUBLIC_` to be accessible

---

## 📊 Testing Checklist

### Without Google Maps / Twilio
- [ ] Register new user
- [ ] Login with credentials
- [ ] View profile screen
- [ ] Add trusted contact
- [ ] Edit contact information
- [ ] Delete contact
- [ ] Change deviation threshold
- [ ] Logout and login again

### With Google Maps
- [ ] Search for destination
- [ ] View route on map
- [ ] Start trip
- [ ] See current location
- [ ] View expected route

### With Twilio
- [ ] Start trip (send start SMS)
- [ ] Receive location updates
- [ ] Test panic button
- [ ] Complete trip (send end SMS)

---

## 💰 Cost Monitoring

### Check Firebase Usage
https://console.firebase.google.com/project/stipator-43658/usage

### Check Google Cloud Billing
https://console.cloud.google.com/billing

### Set Budget Alerts
- Firebase: Set at $10/month
- Google Cloud: Set at $25/month

### Free Tier Limits
- **Functions**: 2M calls/month
- **Firestore**: 50K reads, 20K writes/day
- **Auth**: Unlimited
- **Maps**: $200 credit (~28K map loads)
- **Twilio Trial**: $15 credit (~450 SMS)

---

## 📞 Important Links

- **Firebase Console**: https://console.firebase.google.com/project/stipator-43658
- **Google Cloud Console**: https://console.cloud.google.com/
- **Twilio Console**: https://console.twilio.com/
- **Expo Documentation**: https://docs.expo.dev/

---

## 📝 Documentation Files

- `FIREBASE_SETUP_COMPLETE.md` - Detailed setup documentation
- `IMPLEMENTATION_UPDATES.md` - Feature updates and progress
- `PROJECT_SUMMARY.md` - Complete project overview
- `QUICKSTART.md` - 30-minute quick start guide
- `SETUP.md` - Detailed setup instructions (in stipator-mobile/)

---

**Last Updated**: December 1, 2025  
**Status**: Backend operational, ready for local testing
