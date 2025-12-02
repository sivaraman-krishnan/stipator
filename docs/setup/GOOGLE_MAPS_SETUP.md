# 🗺️ Google Maps API Setup - Ready for Tomorrow

## ✅ Pre-Setup Checklist (Complete These Tonight)

### 1. Account Preparation
- [ ] Have a Google account ready (use: sivaraman.net@gmail.com)
- [ ] Ensure you can access: https://console.cloud.google.com/
- [ ] Have a credit card ready (required, but won't be charged within free tier)

### 2. Project Context
- **Firebase Project**: `stipator-43658`
- **You can**: Use the same Google account or create a separate Google Cloud project
- **Recommended**: Use the same project for easier management

---

## 📋 What You Need to Do Tomorrow (15 minutes)

### Step 1: Access Google Cloud Console (2 min)
1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. **Option A**: Select existing project `stipator-43658` (if available)
4. **Option B**: Create new project called "Stipator Maps" (if separate is preferred)

### Step 2: Enable Required APIs (5 min)
Navigate to **APIs & Services > Library** and enable these 5 APIs:

| API Name | Purpose | Required? |
|----------|---------|-----------|
| **Maps SDK for Android** | Display maps on Android app | ✅ YES |
| **Maps SDK for iOS** | Display maps on iOS app | ✅ YES |
| **Directions API** | Calculate routes between points | ✅ YES |
| **Geocoding API** | Convert addresses to coordinates | ✅ YES |
| **Places API** | Search for destinations | ✅ YES |

**Quick Enable Links** (must be logged in):
- Maps SDK for Android: https://console.cloud.google.com/apis/library/maps-android-backend.googleapis.com
- Maps SDK for iOS: https://console.cloud.google.com/apis/library/maps-ios-backend.googleapis.com
- Directions API: https://console.cloud.google.com/apis/library/directions-backend.googleapis.com
- Geocoding API: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
- Places API: https://console.cloud.google.com/apis/library/places-backend.googleapis.com

### Step 3: Create API Key (3 min)
1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS**
3. Select **API Key**
4. Copy the key immediately (looks like: `AIzaSyC...`)
5. Click **EDIT API KEY** to restrict it (recommended)

### Step 4: Restrict API Key (5 min) - RECOMMENDED
**For Security:**
1. **Application restrictions**:
   - For now: Select "None" (for testing)
   - Later: Restrict by package name
   
2. **API restrictions**:
   - Select "Restrict key"
   - Enable ONLY these 5 APIs:
     - ✅ Maps SDK for Android
     - ✅ Maps SDK for iOS
     - ✅ Directions API
     - ✅ Geocoding API
     - ✅ Places API
   
3. Click **SAVE**

---

## 🔧 After You Get the API Key

### Update .env File
Open: `c:\stipator\stipator-mobile\.env`

Replace this line:
```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

With your actual key:
```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC_YOUR_ACTUAL_KEY_HERE
```

### Update app.json
Open: `c:\stipator\stipator-mobile\app.json`

Find the section (around line 20-30) and add your API key:
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyC_YOUR_ACTUAL_KEY_HERE"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSyC_YOUR_ACTUAL_KEY_HERE"
      }
    }
  }
}
```

---

## 📝 Configuration Files to Update

I've prepared the files that need your API key:

| File | Line/Section | What to Update |
|------|--------------|----------------|
| `.env` | Line 14 | `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=` |
| `app.json` | Android config | `googleMaps.apiKey` |
| `app.json` | iOS config | `googleMapsApiKey` |

---

## 🎯 Quick Commands for Tomorrow

### 1. Check Current Configuration
```powershell
# View current .env file
Get-Content c:\stipator\stipator-mobile\.env | Select-String "GOOGLE_MAPS"

# View app.json google maps section
Get-Content c:\stipator\stipator-mobile\app.json | Select-String -Pattern "google" -Context 3,3
```

### 2. Update .env (After you get the key)
```powershell
cd c:\stipator\stipator-mobile
# Open in your editor and paste the key
code .env
```

### 3. Test the App
```powershell
cd c:\stipator\stipator-mobile
npm start
```

---

## 💰 Cost Information

### Free Tier (More Than Enough for Development)
- **$200 monthly credit** from Google
- Covers approximately:
  - 28,000 map loads
  - 40,000 direction requests
  - 40,000 geocoding requests

### What This Means
- ✅ **Free for development** - Won't hit limits during testing
- ✅ **Free for small production** - 1000-2000 users/month easily covered
- ✅ **No surprise charges** - Set billing alerts

### Billing Setup (Required)
1. Go to: https://console.cloud.google.com/billing
2. Add credit card (required but won't be charged within free tier)
3. Set budget alert at $20/month (optional but recommended)

---

## 🔍 What to Expect After Setup

### ✅ Will Work
- Display interactive map on Start Trip screen
- Search for destinations
- Calculate and display route
- Show current location
- Detect route deviations
- Geocode addresses

### ⚠️ Still Need (Optional)
- Twilio for SMS alerts (can test without this)

---

## 🐛 Common Issues & Solutions

### Issue 1: API Key Not Working
**Solution**: 
- Wait 2-5 minutes after creating (propagation time)
- Check key is enabled for all 5 APIs
- Verify no typos when copying

### Issue 2: "API key not valid"
**Solution**:
- Ensure API restrictions include all 5 required APIs
- Check application restrictions aren't blocking your app

### Issue 3: Maps Not Showing
**Solution**:
- Restart Metro bundler (`npm start`)
- Clear cache: `npx expo start -c`
- Check `.env` has `EXPO_PUBLIC_` prefix

---

## 📞 Resources for Tomorrow

### Google Cloud Console Links
- **Main Console**: https://console.cloud.google.com/
- **APIs & Services**: https://console.cloud.google.com/apis/dashboard
- **Credentials**: https://console.cloud.google.com/apis/credentials
- **Billing**: https://console.cloud.google.com/billing

### Documentation
- **Google Maps Platform**: https://developers.google.com/maps
- **Pricing Calculator**: https://mapsplatform.google.com/pricing/
- **API Key Best Practices**: https://developers.google.com/maps/api-security-best-practices

---

## ✨ Tomorrow's Timeline

| Time | Task | Duration |
|------|------|----------|
| **Start** | Access Google Cloud Console | 2 min |
| **+2 min** | Enable 5 required APIs | 5 min |
| **+7 min** | Create API key | 3 min |
| **+10 min** | Restrict API key (optional) | 5 min |
| **+15 min** | Update .env and app.json | 3 min |
| **+18 min** | Test the app | 2 min |
| **Total** | **Complete Setup** | **~20 minutes** |

---

## 🎯 Success Criteria

You'll know it's working when:
- ✅ Map displays on Start Trip screen
- ✅ You can search for destinations
- ✅ Route shows on map
- ✅ No "API key invalid" errors
- ✅ Current location marker appears

---

## 📋 Preparation Complete!

Everything is ready for tomorrow. When you wake up:
1. Open this file: `docs/setup/GOOGLE_MAPS_SETUP.md`
2. Follow the steps (15-20 minutes)
3. Update the two files (.env and app.json)
4. Test the app!

---

**Current Status:**
- ✅ Firebase Backend: Operational
- ✅ Mobile App: Complete
- ⏳ Google Maps API: Ready to configure tomorrow
- ⏳ Twilio SMS: Optional (later)

**Tomorrow After Setup:**
- ✅ Full app functionality (90% complete)
- ✅ Maps and navigation working
- ✅ Route monitoring active
- ⚠️ SMS alerts (need Twilio)

---

*Preparation completed: December 1, 2025*  
*Ready for setup: Tomorrow morning*  
*Estimated time: 15-20 minutes*  
*Difficulty: Easy ⭐*
