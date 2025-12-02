import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as twilio from 'twilio';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Twilio client
// TODO: Add these to Firebase Functions config:
// firebase functions:config:set twilio.account_sid="YOUR_ACCOUNT_SID"
// firebase functions:config:set twilio.auth_token="YOUR_AUTH_TOKEN"
// firebase functions:config:set twilio.phone_number="YOUR_TWILIO_PHONE_NUMBER"

const twilioAccountSid = functions.config().twilio?.account_sid || process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = functions.config().twilio?.auth_token || process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = functions.config().twilio?.phone_number || process.env.TWILIO_PHONE_NUMBER;

const twilioClient = twilio.default(twilioAccountSid, twilioAuthToken);

interface SMSRequest {
  to: string[];
  message: string;
  location: {
    lat: number;
    lng: number;
  };
}

/**
 * Send SMS alerts to trusted contacts
 */
export const sendSMS = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { to, message, location }: SMSRequest = req.body;

    if (!to || !Array.isArray(to) || to.length === 0) {
      res.status(400).json({ success: false, error: 'Invalid recipients' });
      return;
    }

    if (!message) {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }

    // Validate Twilio configuration
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Twilio configuration missing');
      res.status(500).json({ 
        success: false, 
        error: 'SMS service not configured' 
      });
      return;
    }

    // Send SMS to all contacts
    const results = await Promise.allSettled(
      to.map(async (phoneNumber) => {
        return await twilioClient.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: phoneNumber,
        });
      })
    );

    // Count successes and failures
    const successes = results.filter((r) => r.status === 'fulfilled').length;
    const failures = results.filter((r) => r.status === 'rejected').length;

    console.log(`SMS sent: ${successes} successful, ${failures} failed`);

    // Log to Firestore for tracking
    await admin.firestore().collection('sms_logs').add({
      recipients: to,
      message,
      location,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      successes,
      failures,
    });

    res.status(200).json({
      success: true,
      sent: successes,
      failed: failures,
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS',
    });
  }
});

/**
 * Send batch location updates (called periodically during active trip)
 */
export const sendLocationUpdate = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { tripId, location, userName } = data;

  try {
    // Get trip data from Firestore
    const tripDoc = await admin.firestore().collection('trips').doc(tripId).get();
    
    if (!tripDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Trip not found');
    }

    const trip = tripDoc.data();
    
    if (!trip || trip.userId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Not authorized to access this trip'
      );
    }

    // Get trusted contacts
    const contactsSnapshot = await admin
      .firestore()
      .collection('trusted_contacts')
      .where('userId', '==', context.auth.uid)
      .get();

    const phoneNumbers = contactsSnapshot.docs.map((doc) => doc.data().phone);

    if (phoneNumbers.length === 0) {
      return { success: true, message: 'No contacts to notify' };
    }

    // Generate map link
    const mapLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const timestamp = new Date().toLocaleTimeString();
    const message = `📍 ${userName} location update (${timestamp}): ${mapLink}`;

    // Send SMS
    const results = await Promise.allSettled(
      phoneNumbers.map((phone) =>
        twilioClient.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: phone,
        })
      )
    );

    const successes = results.filter((r) => r.status === 'fulfilled').length;

    return {
      success: true,
      sent: successes,
    };
  } catch (error) {
    console.error('Error sending location update:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send update');
  }
});

/**
 * Scheduled function to check for stale trips (trips that haven't ended)
 */
export const checkStaleTrips = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const fourHoursAgo = new Date(now.toDate().getTime() - 4 * 60 * 60 * 1000);

    // Find active trips older than 4 hours
    const staleTrips = await admin
      .firestore()
      .collection('trips')
      .where('status', '==', 'ACTIVE')
      .where('startTime', '<', fourHoursAgo)
      .get();

    console.log(`Found ${staleTrips.size} stale trips`);

    // Send alerts for stale trips
    const promises = staleTrips.docs.map(async (tripDoc) => {
      const trip = tripDoc.data();
      
      // Get user data
      const userDoc = await admin.firestore().collection('users').doc(trip.userId).get();
      const user = userDoc.data();

      if (!user) return;

      // Get trusted contacts
      const contactsSnapshot = await admin
        .firestore()
        .collection('trusted_contacts')
        .where('userId', '==', trip.userId)
        .get();

      const phoneNumbers = contactsSnapshot.docs.map((doc) => doc.data().phone);

      if (phoneNumbers.length === 0) return;

      const message = `⚠️ ${user.name}'s trip has been active for over 4 hours without completion. Please check on them.`;

      // Send alerts
      await Promise.allSettled(
        phoneNumbers.map((phone) =>
          twilioClient.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phone,
          })
        )
      );
    });

    await Promise.all(promises);
    return null;
  });
