# Stipator 🚕

**Stay Safe, Stay Connected**

Stipator is a mobile emergency-alert system that sends location-based distress notifications to trusted contacts in real time. Primarily designed for women traveling alone in taxis/cabs during vulnerable times, it provides automatic route monitoring and instant alerts to keep you safe.

## 🌟 Features

- **Real-time Location Tracking**: Continuous GPS monitoring during trips
- **Automatic Route Deviation Detection**: Alerts sent if vehicle deviates from expected route
- **SMS Alerts with Live Location**: Trusted contacts receive Google Maps links with your current location
- **Background Monitoring**: Works even when app is minimized or phone screen is off
- **Panic Button**: Instant emergency alerts to all contacts
- **Trusted Contacts Management**: Add up to 5 emergency contacts
- **Cross-Platform**: Works on both iOS and Android

## 📱 How It Works

1. **Add Trusted Contacts**: Set up 1-5 people who will receive your alerts
2. **Enter Destination**: When boarding a taxi, enter where you're going
3. **Start Trip**: App calculates expected route and begins monitoring
4. **Automatic Alerts**: 
   - Trip start notification sent to contacts
   - Location updates every 2-5 minutes
   - Deviation alerts if route changes unexpectedly
   - Completion notification when you arrive safely
5. **Manual Panic**: Emergency button for immediate help

## 🛠️ Technology Stack

### Mobile App
- **React Native** (Expo) with TypeScript
- **Firebase Authentication** for user management
- **Firebase Firestore** for database
- **Expo Location** for GPS tracking
- **React Native Maps** for map display
- **React Navigation** for app navigation

### Backend
- **Firebase Cloud Functions** for serverless backend
- **Twilio API** for SMS notifications
- **Google Maps API** for:
  - Directions API (route calculation)
  - Geocoding API (address lookup)
  - Maps SDK (map display)

## 📂 Project Structure

```
stipator/
├── REQUIREMENTS.md          # Detailed requirements document
├── stipator-mobile/         # React Native mobile app
│   ├── src/
│   │   ├── screens/        # App screens (Login, Home, Trip, etc.)
│   │   ├── services/       # Firebase, Location, Route, Alert services
│   │   ├── navigation/     # Navigation setup
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Helper utilities
│   ├── functions/          # Firebase Cloud Functions
│   │   └── src/
│   │       └── index.ts    # SMS sending functions
│   ├── App.tsx             # Main app entry point
│   ├── app.json            # Expo configuration
│   └── package.json        # Dependencies
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19.4 or higher
- Expo CLI
- Firebase account
- Google Cloud account (for Maps API)
- Twilio account

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/sivaraman-net/stipator.git
   cd stipator/stipator-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase, Google Maps, and Twilio credentials
   ```

4. **Run the app**
   ```bash
   npm start
   ```

## 📚 Documentation

For comprehensive documentation, see the **[Documentation Index](docs/INDEX.md)**

**Quick Links:**
- **[30-Minute Quickstart](docs/setup/QUICKSTART.md)** - Get started fast
- **[Firebase Setup Guide](docs/setup/FIREBASE_SETUP.md)** - Backend configuration
- **[Quick Reference](docs/reference/QUICK_REFERENCE.md)** - Commands and credentials
- **[Project Summary](docs/project/PROJECT_SUMMARY.md)** - Complete overview
- **[Mobile App Setup](stipator-mobile/SETUP.md)** - Detailed app setup

**Current Status (Dec 1, 2025):**
- ✅ Firebase Backend: Fully configured and operational
- ✅ Mobile App: Complete with 8 screens
- ⚠️ Google Maps API: Configuration needed
- ⚠️ Twilio SMS: Optional configuration

## 🔐 Security & Privacy

- **No Location History Storage**: Location data is only kept during active trips
- **End-to-End Encryption**: All data transmitted securely
- **Firestore Security Rules**: Users can only access their own data
- **Optional Auto-Delete**: Trip data automatically deleted after 24 hours
- **Permission-Based**: Location tracking only active during trips

## 💰 Cost Estimates

For 1000 active users per month:

- **Firebase**: ~$25-50 (Firestore + Functions)
- **Google Maps API**: ~$5-20 (with $200 monthly credit)
- **Twilio SMS**: ~$50-100 (at $0.0075 per SMS)

**Total**: ~$80-170/month

Free tier sufficient for development and testing.

## 🎯 Roadmap

### Phase 1 (MVP) ✅
- [x] User authentication
- [x] Trusted contacts management
- [x] Trip creation and monitoring
- [x] SMS alerts with location links
- [x] Route deviation detection
- [x] Panic button

### Phase 2 (Future)
- [ ] Multiple alert channels (WhatsApp, Telegram)
- [ ] Trip history and analytics
- [ ] Scheduled/recurring trips
- [ ] Direct emergency services integration
- [ ] Audio/video recording
- [ ] Web dashboard for contacts
- [ ] Community safety features
- [ ] Wearable device support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

For questions or support:
- GitHub Issues: [stipator/issues](https://github.com/sivaraman-net/stipator/issues)
- Email: [your-email@example.com]

## ⚠️ Disclaimer

Stipator is a safety tool designed to alert trusted contacts during travel. It should not replace official emergency services (911, 100, etc.). Always contact local authorities in case of immediate danger.

---

**Built with ❤️ for safer travels**
Stipator is a mobile emergency-alert system that sends location-based distress notifications to trusted contacts in real time.
