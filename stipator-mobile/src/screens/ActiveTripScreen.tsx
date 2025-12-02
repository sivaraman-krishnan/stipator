import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { doc, getDoc, updateDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import LocationService from '../services/location';
import RouteService from '../services/route';
import AlertService from '../services/alert';
import { Location, Trip, TripStatus } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type ActiveTripScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ActiveTrip'>;
  route: RouteProp<RootStackParamList, 'ActiveTrip'>;
};

const UPDATE_INTERVAL = 120000; // 2 minutes
const DEVIATION_CHECK_INTERVAL = 30000; // 30 seconds

export default function ActiveTripScreen({
  navigation,
  route: navRoute,
}: ActiveTripScreenProps) {
  const { tripId } = navRoute.params;
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeviated, setIsDeviated] = useState(false);
  const [deviationThreshold, setDeviationThreshold] = useState(500);
  
  const locationService = LocationService.getInstance();
  const alertService = AlertService.getInstance();
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const deviationCheckRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeTrip();
    return () => {
      cleanup();
    };
  }, []);

  const initializeTrip = async () => {
    try {
      // Load trip data
      const tripDoc = await getDoc(doc(db, 'trips', tripId));
      if (!tripDoc.exists()) {
        Alert.alert('Error', 'Trip not found');
        navigation.goBack();
        return;
      }

      const tripData = {
        id: tripDoc.id,
        ...tripDoc.data(),
      } as Trip;
      setTrip(tripData);

      // Load user's deviation threshold preference
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDeviationThreshold(userData.deviationThreshold || 500);
        }
      }

      // Start location tracking
      const started = await locationService.startTracking(handleLocationUpdate);
      if (!started) {
        Alert.alert('Error', 'Failed to start location tracking');
        navigation.goBack();
        return;
      }

      // Set up periodic location updates to contacts
      updateIntervalRef.current = setInterval(() => {
        sendLocationUpdate();
      }, UPDATE_INTERVAL);

      // Set up deviation checking
      deviationCheckRef.current = setInterval(() => {
        checkDeviation();
      }, DEVIATION_CHECK_INTERVAL);

      setLoading(false);
    } catch (error) {
      console.error('Error initializing trip:', error);
      Alert.alert('Error', 'Failed to initialize trip');
      navigation.goBack();
    }
  };

  const handleLocationUpdate = async (location: Location) => {
    setCurrentLocation(location);

    // Update trip location in Firestore
    try {
      await updateDoc(doc(db, 'trips', tripId), {
        lastLocationUpdate: new Date(),
      });
    } catch (error) {
      console.error('Error updating trip location:', error);
    }
  };

  const checkDeviation = async () => {
    if (!currentLocation || !trip) return;

    const deviated = RouteService.isDeviating(
      currentLocation,
      trip.expectedRoute,
      deviationThreshold // User's configured threshold
    );

    if (deviated && !isDeviated) {
      // First time deviation detected
      setIsDeviated(true);
      await handleDeviation();
    } else if (!deviated && isDeviated) {
      // Back on route
      setIsDeviated(false);
    }
  };

  const handleDeviation = async () => {
    if (!currentLocation || !trip) return;

    try {
      // Update trip status
      await updateDoc(doc(db, 'trips', tripId), {
        deviationDetected: true,
      });

      // Get user data
      const user = auth.currentUser;
      if (!user) return;

      const userQuery = query(
        collection(db, 'users'),
        where('__name__', '==', user.uid)
      );
      const userSnapshot = await getDocs(userQuery);
      const userData = userSnapshot.docs[0]?.data();

      // Get trusted contacts
      const contactsQuery = query(
        collection(db, 'trusted_contacts'),
        where('userId', '==', user.uid)
      );
      const contactsSnapshot = await getDocs(contactsQuery);
      const contacts = contactsSnapshot.docs.map((doc) => doc.data().phone);

      // Send deviation alert
      await alertService.sendDeviationAlert(
        userData?.name || 'User',
        currentLocation,
        contacts
      );

      Alert.alert(
        'Route Deviation Detected',
        'Your trusted contacts have been notified'
      );
    } catch (error) {
      console.error('Error handling deviation:', error);
    }
  };

  const sendLocationUpdate = async () => {
    if (!currentLocation || !trip) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get user data
      const userQuery = query(
        collection(db, 'users'),
        where('__name__', '==', user.uid)
      );
      const userSnapshot = await getDocs(userQuery);
      const userData = userSnapshot.docs[0]?.data();

      // Get trusted contacts
      const contactsQuery = query(
        collection(db, 'trusted_contacts'),
        where('userId', '==', user.uid)
      );
      const contactsSnapshot = await getDocs(contactsQuery);
      const contacts = contactsSnapshot.docs.map((doc) => doc.data().phone);

      // Send location update
      await alertService.sendLocationUpdate(
        userData?.name || 'User',
        currentLocation,
        contacts
      );
    } catch (error) {
      console.error('Error sending location update:', error);
    }
  };

  const handlePanicButton = () => {
    Alert.alert(
      'Panic Alert',
      'Are you sure you want to send an emergency alert to all your trusted contacts?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: sendPanicAlert,
        },
      ]
    );
  };

  const sendPanicAlert = async () => {
    if (!currentLocation) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get user data
      const userQuery = query(
        collection(db, 'users'),
        where('__name__', '==', user.uid)
      );
      const userSnapshot = await getDocs(userQuery);
      const userData = userSnapshot.docs[0]?.data();

      // Get trusted contacts
      const contactsQuery = query(
        collection(db, 'trusted_contacts'),
        where('userId', '==', user.uid)
      );
      const contactsSnapshot = await getDocs(contactsQuery);
      const contacts = contactsSnapshot.docs.map((doc) => doc.data().phone);

      // Send panic alert
      await alertService.sendPanicAlert(
        userData?.name || 'User',
        currentLocation,
        contacts
      );

      Alert.alert('Alert Sent', 'Emergency alert sent to all contacts');
    } catch (error) {
      console.error('Error sending panic alert:', error);
      Alert.alert('Error', 'Failed to send alert');
    }
  };

  const handleEndTrip = () => {
    Alert.alert(
      'End Trip',
      'Have you reached your destination safely?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: "I'm Safe",
          onPress: endTrip,
        },
      ]
    );
  };

  const endTrip = async () => {
    if (!currentLocation) return;

    setLoading(true);
    try {
      // Update trip status
      await updateDoc(doc(db, 'trips', tripId), {
        status: TripStatus.COMPLETED,
        endTime: new Date(),
      });

      // Get user data
      const user = auth.currentUser;
      if (!user) return;

      const userQuery = query(
        collection(db, 'users'),
        where('__name__', '==', user.uid)
      );
      const userSnapshot = await getDocs(userQuery);
      const userData = userSnapshot.docs[0]?.data();

      // Get trusted contacts
      const contactsQuery = query(
        collection(db, 'trusted_contacts'),
        where('userId', '==', user.uid)
      );
      const contactsSnapshot = await getDocs(contactsQuery);
      const contacts = contactsSnapshot.docs.map((doc) => doc.data().phone);

      // Send trip end alert
      await alertService.sendTripEndAlert(
        userData?.name || 'User',
        currentLocation,
        contacts
      );

      Alert.alert('Trip Completed', 'Your contacts have been notified', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (error) {
      console.error('Error ending trip:', error);
      Alert.alert('Error', 'Failed to end trip');
    } finally {
      setLoading(false);
    }
  };

  const cleanup = async () => {
    // Clear intervals
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
    if (deviationCheckRef.current) {
      clearInterval(deviationCheckRef.current);
    }

    // Stop location tracking
    await locationService.stopTracking();
  };

  if (loading || !trip) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Starting trip...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: trip.origin.lat,
          longitude: trip.origin.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker
          coordinate={{
            latitude: trip.destination.lat,
            longitude: trip.destination.lng,
          }}
          title="Destination"
          pinColor="#FF6B6B"
        />
        {trip.expectedRoute.length > 0 && (
          <Polyline
            coordinates={trip.expectedRoute.map((point) => ({
              latitude: point.lat,
              longitude: point.lng,
            }))}
            strokeColor={isDeviated ? '#FFA500' : '#4A90E2'}
            strokeWidth={3}
          />
        )}
      </MapView>

      {isDeviated && (
        <View style={styles.deviationBanner}>
          <Text style={styles.deviationText}>
            ⚠️ Route Deviation Detected
          </Text>
        </View>
      )}

      <View style={styles.bottomSheet}>
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Trip Active</Text>
        </View>

        <Text style={styles.destinationText}>
          To: {trip.destination.address}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.panicButton}
            onPress={handlePanicButton}
          >
            <Text style={styles.panicButtonText}>🚨 PANIC</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endButton}
            onPress={handleEndTrip}
            disabled={loading}
          >
            <Text style={styles.endButtonText}>
              {loading ? 'Ending...' : "I'm Safe"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>
          Your location is being shared with trusted contacts
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  deviationBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#FFA500',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  deviationText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  destinationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  panicButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  panicButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  endButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
