# EAS Build - Production Deployment Guide

## 🚀 Building a Production APK with EAS Build

This guide walks you through creating a production-ready Android APK that includes all native modules (including Google Maps).

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Stipator mobile app code (complete)
- ✅ Firebase configured and working
- ✅ Google Maps API key configured
- ✅ Internet connection
- ✅ Expo account (free - will create during setup)

---

## 🔧 Step 1: Install EAS CLI

Open PowerShell in the `stipator-mobile` directory:

```powershell
cd c:\stipator\stipator-mobile
npm install -g eas-cli
```

---

## 🔐 Step 2: Create Expo Account & Login

### Create Account:
1. Go to https://expo.dev/signup
2. Sign up with email or GitHub
3. Verify your email

### Login via CLI:
```powershell
eas login
```

Enter your Expo credentials when prompted.

---

## 🎯 Step 3: Configure EAS Build

### Initialize EAS in your project:
```powershell
eas build:configure
```

This creates an `eas.json` configuration file.

### Update `eas.json`:

The command above creates a default file. Let's optimize it for our needs:

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🔑 Step 4: Configure App Identifiers

Update `app.json` to add proper identifiers:

```json
{
  "expo": {
    "name": "Stipator",
    "slug": "stipator",
    "version": "1.0.0",
    "owner": "your-expo-username",  // Add this - your Expo username
    "android": {
      "package": "com.stipator.app",
      "versionCode": 1,
      // ... rest of android config
    }
  }
}
```

---

## 🏗️ Step 5: Build for Android

### Build Options:

#### **Option A: Preview Build (Recommended for Testing)**
This creates an APK you can install directly on your phone:

```powershell
eas build --platform android --profile preview
```

**Advantages:**
- ✅ Fast build (15-20 minutes)
- ✅ Direct APK download
- ✅ Easy to install on device
- ✅ Includes all native modules (Maps will work!)

#### **Option B: Production Build**
For final release to Google Play Store:

```powershell
eas build --platform android --profile production
```

### Build Process:

1. **EAS will ask for credentials**:
   ```
   ? Would you like to generate a new Android Keystore? (Y/n)
   ```
   Type `Y` - EAS will generate and manage your signing credentials.

2. **Build starts**:
   - Code is uploaded to EAS servers
   - Native Android project is generated
   - Dependencies are installed
   - App is compiled with all native modules
   - APK is signed and packaged

3. **Monitor progress**:
   - You'll see a URL like: https://expo.dev/accounts/[username]/projects/stipator/builds/[build-id]
   - Open in browser to watch build progress
   - Typical build time: 15-25 minutes

4. **Build completes**:
   ```
   ✔ Build finished
   
   APK: https://expo.dev/artifacts/eas/[artifact-id].apk
   ```

---

## 📥 Step 6: Download and Install APK

### Download APK:
1. Open the build URL from terminal
2. Click "Download" button
3. Save APK file (e.g., `stipator-v1.0.0.apk`)

### Install on Android Device:

#### Method 1: Direct Download on Phone
1. On your phone, open the build URL in browser
2. Download the APK directly
3. Android will ask for permission to install from unknown sources
4. Grant permission and install

#### Method 2: Transfer from PC
1. Connect phone to PC via USB
2. Enable "File Transfer" mode on phone
3. Copy APK to phone's Download folder
4. On phone, use File Manager to find APK
5. Tap APK to install

### First Launch Setup:
When you first open the app, Android may ask for:
- ✅ Location permissions: **Allow all the time** (required for trip monitoring)
- ✅ Notifications: **Allow** (for trip alerts)

---

## 🧪 Step 7: Test Full Functionality

Now that you have the native build installed, test everything:

### Authentication:
- [ ] Register new account
- [ ] Login with credentials
- [ ] Logout

### Trusted Contacts:
- [ ] Add contact with phone number
- [ ] View contacts list
- [ ] Delete contact

### Trip Features (NOW WORKING!):
- [ ] **Start Trip screen opens** (Maps should load!)
- [ ] **See your current location on map**
- [ ] **Search and select destination**
- [ ] **Route displays on map**
- [ ] **Start monitoring**
- [ ] **Active Trip screen shows real-time GPS**
- [ ] **Location updates as you move**

### Settings:
- [ ] Adjust deviation threshold
- [ ] Save settings
- [ ] See visual confirmation

### Background Functionality:
- [ ] Start a trip
- [ ] Press home button (app goes to background)
- [ ] App should continue monitoring
- [ ] Test deviation by moving off route

---

## 🐛 Troubleshooting

### Build Fails with "Credentials Error"
**Solution:** Run:
```powershell
eas credentials
```
Regenerate credentials if needed.

### "Module not found" Error
**Solution:** Make sure all dependencies are in `package.json`:
```powershell
npx expo install --check
```

### Google Maps Not Showing
**Check:**
1. Is API key in `app.json` under both `android.config.googleMaps.apiKey` and `ios.config.googleMapsApiKey`?
2. Are all 5 Google Maps APIs enabled in Google Cloud Console?
3. Is billing enabled for Google Cloud project?

### App Crashes on Launch
**Check logs:**
```powershell
adb logcat | Select-String "stipator"
```

---

## 📱 Step 8: Update and Rebuild

When you make code changes:

1. **Commit your changes** to git
2. **Rebuild**:
   ```powershell
   eas build --platform android --profile preview
   ```
3. **Download new APK**
4. **Install over existing app** (data persists)

---

## 🚀 Step 9: Production Deployment

### For Google Play Store:

1. **Build Production AAB** (not APK):
   ```powershell
   eas build --platform android --profile production
   ```
   This creates an Android App Bundle (.aab) required by Play Store.

2. **Create Google Play Developer Account**:
   - Cost: $25 one-time fee
   - URL: https://play.google.com/console

3. **Submit via EAS**:
   ```powershell
   eas submit --platform android --profile production
   ```

4. **App Review**:
   - Google reviews app (usually 1-3 days)
   - App goes live on Play Store

---

## 💰 Cost Breakdown

### Free Tier:
- ✅ Expo account: **Free**
- ✅ EAS Build: **Free tier includes builds** (limited per month)
- ✅ Firebase: **Free (Blaze plan with minimal usage)**
- ✅ Google Maps API: **$200/month free credit** (covers typical usage)

### Paid (Optional):
- 💳 EAS Build unlimited: **$29/month** (if you exceed free builds)
- 💳 Google Play Store: **$25 one-time**
- 💳 Apple Developer: **$99/year** (if building for iOS)

**For initial testing: $0 using free tiers!**

---

## 🎯 Expected Timeline

| Task | Duration |
|------|----------|
| Install EAS CLI | 2 minutes |
| Create Expo account | 3 minutes |
| Configure EAS | 5 minutes |
| First build (cloud) | 15-25 minutes |
| Download APK | 1-2 minutes |
| Install on device | 2 minutes |
| **Total First Time** | **~30-40 minutes** |
| **Subsequent Builds** | **~20 minutes each** |

---

## 📊 What You Get

### With EAS Production Build:
- ✅ **All native modules included** (Maps work!)
- ✅ **Optimized performance**
- ✅ **Smaller app size** (optimized bundle)
- ✅ **Production-ready** (can submit to stores)
- ✅ **Signed APK** (installable on any Android device)
- ✅ **Real GPS tracking**
- ✅ **Background location updates**
- ✅ **Full Firebase integration**

---

## 🔄 Alternative: Development Build

If you want faster iteration during development:

```powershell
# Install dev client
npx expo install expo-dev-client

# Build dev version
eas build --platform android --profile development

# Run dev server
npx expo start --dev-client
```

**Development Build advantages:**
- Faster: Changes reflect without rebuilding APK
- Hot reload works
- Better debugging tools

**Use case:** Active development with frequent changes

---

## 📞 Support Resources

### EAS Build Documentation:
- https://docs.expo.dev/build/introduction/

### EAS Build Status:
- https://expo.dev/

### Community:
- Expo Discord: https://chat.expo.dev/
- Expo Forums: https://forums.expo.dev/

---

## ✅ Checklist Before Building

- [ ] Firebase fully configured and tested
- [ ] Google Maps API key in `app.json` for both platforms
- [ ] All 5 Maps APIs enabled in Google Cloud
- [ ] `.env` file with all credentials
- [ ] `package.json` dependencies up to date
- [ ] Git committed (recommended for tracking)
- [ ] Expo account created and logged in
- [ ] EAS CLI installed globally
- [ ] `eas.json` configured

---

## 🎉 Next Steps After Successful Build

1. ✅ **Install and test APK on device**
2. ✅ **Verify all features work** (especially maps!)
3. ✅ **Test real-world trip monitoring**
4. ✅ **Collect feedback** from test users
5. ✅ **Make refinements** if needed
6. ✅ **Build production version**
7. ✅ **Submit to Google Play Store**

---

**Ready to build?** Run the first command and follow the prompts!

```powershell
cd c:\stipator\stipator-mobile
eas build --platform android --profile preview
```

---

**Last Updated:** December 1, 2025  
**Status:** Ready for Build
