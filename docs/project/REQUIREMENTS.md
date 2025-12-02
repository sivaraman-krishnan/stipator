# Stipator - Requirements Document

**Version:** 1.0  
**Date:** November 24, 2025  
**Project:** Mobile Emergency Alert System

---

## 1. Overview

**Stipator** is a mobile emergency-alert system that sends location-based distress notifications to trusted contacts in real time. Primarily designed for women traveling alone in taxis/cabs during odd hours, it automatically monitors route deviations and shares live location updates.

---

## 2. Core Objectives

- Provide automatic, passive safety monitoring without manual intervention
- Enable real-time location tracking and sharing with trusted contacts
- Detect route deviations and send enhanced alerts
- Maintain user privacy with minimal data storage

---

## 3. Platform Requirements

### 3.1 Target Platforms
- **iOS** (iPhone) - iOS 14.0+
- **Android** - Android 8.0 (API 26)+

### 3.2 Device Requirements
- GPS/Location services enabled
- Internet connectivity (cellular data or WiFi)
- Background location permissions

---

## 4. Functional Requirements

### 4.1 User Management
- **FR-1.1:** User registration and authentication
- **FR-1.2:** User profile management (name, phone number, email)
- **FR-1.3:** Trusted contacts management (add, edit, remove contacts)
- **FR-1.4:** Contact verification (ensure contacts can receive alerts)

### 4.2 Trip Management
- **FR-2.1:** User enters destination address before starting trip
- **FR-2.2:** App calculates optimal/expected route using mapping service
- **FR-2.3:** User initiates trip with "Start Trip" button
- **FR-2.4:** User ends trip with "I'm Safe" button
- **FR-2.5:** Trip data cleared after completion

### 4.3 Location Tracking
- **FR-3.1:** Continuous GPS tracking during active trip
- **FR-3.2:** Background location tracking (app works even when minimized)
- **FR-3.3:** Location updates every 30-60 seconds
- **FR-3.4:** Battery-optimized tracking algorithms

### 4.4 Route Monitoring
- **FR-4.1:** Real-time comparison of actual route vs. expected route
- **FR-4.2:** Deviation detection algorithm with configurable threshold (e.g., 500m off-route)
- **FR-4.3:** Smart filtering to ignore legitimate deviations (traffic, detours)
- **FR-4.4:** Automatic alert trigger on significant deviation

### 4.5 Alert & Notification System
- **FR-5.1:** **Primary Channel: SMS with Google Maps Link**
  - SMS sent to all trusted contacts when trip starts
  - Contains: User name, destination, live tracking link
  - Periodic location updates (every 2-5 minutes) via SMS with Google Maps link
  
- **FR-5.2:** Enhanced alert on route deviation
  - SMS with "⚠️ ROUTE DEVIATION DETECTED" message
  - Current location map link
  - More frequent updates (every 30-60 seconds)

- **FR-5.3:** Trip completion notification
  - "✅ [User] has reached destination safely" SMS

### 4.6 Emergency Features
- **FR-6.1:** Manual panic button for immediate alert
- **FR-6.2:** Shake-to-alert functionality (optional)
- **FR-6.3:** Trip auto-extension if destination not reached within expected time

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **NFR-1.1:** Location updates processed within 5 seconds
- **NFR-1.2:** Alert delivery within 10 seconds of trigger
- **NFR-1.3:** App startup time < 3 seconds
- **NFR-1.4:** Battery consumption optimized for 4+ hour continuous tracking

### 5.2 Reliability
- **NFR-2.1:** 99.5% uptime for location tracking service
- **NFR-2.2:** Graceful handling of network interruptions
- **NFR-2.3:** Location data queued and sent when connectivity restored

### 5.3 Security & Privacy
- **NFR-3.1:** End-to-end encryption for location data transmission
- **NFR-3.2:** No long-term storage of location history
- **NFR-3.3:** User authentication with secure token management
- **NFR-3.4:** Trusted contacts cannot be added without user consent
- **NFR-3.5:** Location data deleted within 24 hours of trip completion

### 5.4 Usability
- **NFR-4.1:** Simple, intuitive UI requiring minimal user training
- **NFR-4.2:** Maximum 3 taps to start a trip
- **NFR-4.3:** Clear visual indicators for active trip status
- **NFR-4.4:** Support for multiple languages (initially English)

---

## 6. Technical Architecture

### 6.1 Mobile App Stack
**Option 1: React Native (Recommended for MVP)**
- Cross-platform (iOS + Android from single codebase)
- Fast development time
- Good community support
- Native module access for GPS

**Option 2: Native Development**
- Swift (iOS) + Kotlin (Android)
- Best performance and platform integration
- Higher development time and cost

### 6.2 Backend Services
- **Cloud Platform:** Firebase (Google) or AWS
- **Database:** Firestore/DynamoDB for user & contact data
- **Authentication:** Firebase Auth or AWS Cognito
- **Push Notifications:** FCM (Firebase Cloud Messaging)
- **Location Services:** Google Maps API / Google Places API

### 6.3 SMS Integration
- **Twilio API** (Primary choice - easiest and fastest)
  - Programmable SMS
  - Global coverage
  - Reliable delivery
  - Simple REST API integration

### 6.4 Key Components
```
Mobile App
├── User Interface Layer
├── Location Services Manager
├── Route Monitoring Engine
├── Alert Management System
└── Data Sync Layer

Backend Services
├── User Authentication Service
├── Trip Management Service
├── Location Processing Service
├── SMS Notification Service (Twilio)
└── Route Calculation Service (Google Maps)
```

---

## 7. User Flow

### 7.1 First-Time Setup
1. Download and install Stipator app
2. Register account (phone number + email)
3. Verify phone number (OTP)
4. Add trusted contacts (minimum 1, maximum 5)
5. Grant location permissions
6. Complete onboarding tutorial

### 7.2 Trip Workflow
1. Open app and enter destination
2. View calculated route on map
3. Tap "Start Trip" when boarding cab
4. → **Automatic SMS sent to contacts:** "🚕 [User] started trip to [Destination]. Track live: [Google Maps Link]"
5. App tracks location in background
6. → **Periodic SMS updates** (every 2-5 minutes) with current location link
7. If deviation detected:
   - → **Alert SMS:** "⚠️ ROUTE DEVIATION: [User] deviated from route. Current location: [Link]"
   - → Increased update frequency
8. User taps "I'm Safe" upon arrival
9. → **Completion SMS:** "✅ [User] reached destination safely"
10. Trip data cleared

---

## 8. Data Models

### 8.1 User
```
{
  id: UUID,
  name: String,
  email: String,
  phone: String,
  createdAt: Timestamp,
  lastActive: Timestamp
}
```

### 8.2 Trusted Contact
```
{
  id: UUID,
  userId: UUID (foreign key),
  name: String,
  phone: String,
  relationship: String (optional),
  isVerified: Boolean,
  addedAt: Timestamp
}
```

### 8.3 Trip
```
{
  id: UUID,
  userId: UUID,
  origin: {lat: Number, lng: Number, address: String},
  destination: {lat: Number, lng: Number, address: String},
  expectedRoute: Array<{lat: Number, lng: Number}>,
  status: Enum [ACTIVE, COMPLETED, CANCELLED],
  startTime: Timestamp,
  endTime: Timestamp,
  deviationDetected: Boolean,
  lastLocationUpdate: Timestamp
}
```

### 8.4 Location Update (Temporary)
```
{
  tripId: UUID,
  location: {lat: Number, lng: Number},
  timestamp: Timestamp,
  accuracy: Number,
  ttl: 24 hours (auto-delete)
}
```

---

## 9. MVP Scope (Phase 1)

### In Scope
✅ User registration and authentication  
✅ Add/manage up to 5 trusted contacts  
✅ Enter destination and view route  
✅ Start/end trip functionality  
✅ Continuous background GPS tracking  
✅ SMS alerts via Twilio with Google Maps links  
✅ Route deviation detection with 500m default threshold  
✅ User-configurable deviation sensitivity (200m - 1000m)  
✅ Manual panic button  
✅ Phone battery death handling (last known location + 4-hour alert)  
✅ iOS and Android apps (React Native)  
✅ 100% Free - no premium tiers  

### Out of Scope (Future Phases)

**Phase 2 - Enhanced Communication**
❌ Multiple alert channels (WhatsApp, Facebook Messenger, Telegram)  
❌ Web dashboard for trusted contacts  
❌ In-app chat between traveler and contacts  
❌ Push notifications as alternative to SMS  

**Phase 3 - Advanced Features**
❌ Audio/video recording during trip  
❌ Direct police/emergency services integration  
❌ Trip history and analytics dashboard  
❌ AI-powered route learning and anomaly detection  

**Phase 4 - Ecosystem Integration**
❌ Ride-sharing app integration (Uber, Lyft, Ola)  
❌ Scheduled/recurring trips  
❌ Community safety features and crowdsourced safety ratings  
❌ Wearable device support (Apple Watch, Android Wear)  
❌ Smart home integration (notify home devices)  

---

## 10. Success Metrics

- **Adoption:** 10,000+ downloads in first 6 months
- **Engagement:** 60%+ of users add trusted contacts within first session
- **Reliability:** 99%+ alert delivery success rate
- **Performance:** <5% battery drain per hour of tracking
- **User Satisfaction:** 4.5+ star rating on app stores

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| High battery consumption | High | Implement battery-optimized tracking algorithms |
| SMS delivery failures | High | Retry mechanism + fallback notification methods |
| False positive deviations | Medium | Smart route deviation algorithm with learning |
| Network connectivity loss | High | Queue alerts locally, send when reconnected |
| User privacy concerns | Medium | Clear privacy policy, minimal data storage |
| Platform permission denials | High | Clear onboarding explaining why permissions needed |

---

## 12. Timeline Estimate (MVP)

- **Week 1-2:** Project setup, architecture design, API integrations
- **Week 3-4:** Backend services development (auth, user management)
- **Week 5-7:** Mobile app core features (UI, location tracking)
- **Week 8-9:** SMS integration and alert system
- **Week 10-11:** Route deviation algorithm implementation
- **Week 12-13:** Testing (unit, integration, end-to-end)
- **Week 14:** Beta testing with real users
- **Week 15-16:** Bug fixes, optimization, app store submission

**Total: 16 weeks (4 months)**

---

## 13. Decisions on Open Questions

### ✅ Resolved

1. **In-app chat for trusted contacts?**
   - **Decision**: Not in MVP, can be added in Phase 2
   - **Rationale**: Adds complexity; SMS is sufficient for emergency communication

2. **What happens if user's phone dies during trip?**
   - **Decision**: Last known location is automatically the final update sent to contacts
   - **Implementation**: 
     - Trusted contacts receive regular updates every 2-5 minutes
     - If phone dies, last location update remains accessible via SMS history
     - Backend scheduled function checks for trips active > 4 hours without updates
     - Sends alert to contacts: "Trip has been active for 4+ hours without updates"
   - **Future Enhancement**: Consider integration with smartwatch/wearables as backup

3. **Web dashboard for trusted contacts?**
   - **Decision**: Great feature, but not for MVP (Phase 2)
   - **Future Implementation**: 
     - Web app where contacts can view live trip on full-screen map
     - Trip history and analytics
     - Two-way communication with traveler

4. **Premium vs. free tier model?**
   - **Decision**: Entire app is FREE for all users
   - **Monetization Strategy**: Consider these alternatives in future:
     - Donations/voluntary support
     - Corporate sponsorships
     - Government/NGO partnerships for women's safety
     - Grant funding from safety organizations

5. **How to handle international SMS costs?**
   - **Decision**: Multi-channel approach to reduce SMS dependency
   - **Phase 1 (MVP)**: SMS via Twilio (simple, universal)
   - **Phase 2**: Add free alternatives:
     - WhatsApp Business API (free with data)
     - Facebook Messenger integration
     - Telegram Bot API
     - Push notifications (for contacts who also have the app)
   - **User Choice**: Let users select preferred alert channels per contact

6. **Should deviation threshold be user-configurable?**
   - **Decision**: YES - Default with user configuration
   - **Implementation**:
     - Default threshold: 500 meters (0.3 miles)
     - Settings screen with slider: 200m (sensitive) to 1000m (relaxed)
     - Recommended: 500m for urban areas, 800m for highways
     - Store preference in user profile
   - **UI**: "Alert Sensitivity" setting with three presets:
     - High (200m) - Dense urban areas
     - Medium (500m) - Default, balanced
     - Low (800m) - Highways, rural areas

---

## 14. Next Steps

1. ✅ Requirements documentation complete
2. ⏳ Set up development environment
3. ⏳ Create Firebase/AWS project
4. ⏳ Register Twilio account and get API credentials
5. ⏳ Set up Google Maps API
6. ⏳ Initialize React Native project structure
7. ⏳ Design database schema
8. ⏳ Create UI/UX mockups
9. ⏳ Begin backend API development
10. ⏳ Begin mobile app development

---

**Document Owner:** Development Team  
**Last Updated:** November 24, 2025
