import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import LocationService from '../services/location';
import RouteService from '../services/route';
import AlertService from '../services/alert';
import { Location, TripStatus } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type StartTripScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'StartTrip'>;
};

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function StartTripScreen({ navigation }: StartTripScreenProps) {
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(
    null
  );
  const [route, setRoute] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(true);

  const locationService = LocationService.getInstance();
  const alertService = AlertService.getInstance();

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    const hasPermission = await locationService.hasPermissions();
    if (!hasPermission) {
      const granted = await locationService.requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Location permission is required to use this feature'
        );
        navigation.goBack();
        return;
      }
    }

    const location = await locationService.getCurrentLocation();
    if (location) {
      setCurrentLocation(location);
    }
    setFetchingLocation(false);
  };

  const handleSearchDestination = async () => {
    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Error', 'Current location not available');
      return;
    }

    setLoading(true);
    try {
      // Use Google Places API to geocode destination
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        destination
      )}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const destLocation: Location = {
          lat: location.lat,
          lng: location.lng,
        };
        setDestinationLocation(destLocation);

        // Get route
        const routePoints = await RouteService.getDirections(
          currentLocation,
          destLocation,
          GOOGLE_MAPS_API_KEY
        );
        setRoute(routePoints);
      } else {
        Alert.alert('Error', 'Could not find destination');
      }
    } catch (error) {
      console.error('Error searching destination:', error);
      Alert.alert('Error', 'Failed to search destination');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async () => {
    if (!currentLocation || !destinationLocation) {
      Alert.alert('Error', 'Please search for a destination first');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    // Check if user has trusted contacts
    const contactsQuery = query(
      collection(db, 'trusted_contacts'),
      where('userId', '==', user.uid)
    );
    const contactsSnapshot = await getDocs(contactsQuery);

    if (contactsSnapshot.empty) {
      Alert.alert(
        'No Contacts',
        'Please add trusted contacts before starting a trip',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add Contacts',
            onPress: () => navigation.navigate('TrustedContacts'),
          },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      // Get user data
      const userDoc = await getDocs(
        query(collection(db, 'users'), where('__name__', '==', user.uid))
      );
      const userData = userDoc.docs[0]?.data();

      // Get origin address
      const originAddress = await RouteService.getAddress(
        currentLocation,
        GOOGLE_MAPS_API_KEY
      );
      const destAddress = destination;

      // Create trip in Firestore
      const tripRef = await addDoc(collection(db, 'trips'), {
        userId: user.uid,
        origin: {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          address: originAddress,
        },
        destination: {
          lat: destinationLocation.lat,
          lng: destinationLocation.lng,
          address: destAddress,
        },
        expectedRoute: route,
        status: TripStatus.ACTIVE,
        startTime: new Date(),
        deviationDetected: false,
        lastLocationUpdate: new Date(),
      });

      // Send start trip alert to contacts
      const contacts = contactsSnapshot.docs.map((doc) => doc.data().phone);
      await alertService.sendTripStartAlert(
        userData?.name || 'User',
        destAddress,
        currentLocation,
        contacts
      );

      // Navigate to active trip screen
      navigation.replace('ActiveTrip', { tripId: tripRef.id });
    } catch (error) {
      console.error('Error starting trip:', error);
      Alert.alert('Error', 'Failed to start trip');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingLocation) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.mapContainer}>
        {currentLocation && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation
            showsMyLocationButton
          >
            {destinationLocation && (
              <Marker
                coordinate={{
                  latitude: destinationLocation.lat,
                  longitude: destinationLocation.lng,
                }}
                title="Destination"
                pinColor="#FF6B6B"
              />
            )}
            {route.length > 0 && (
              <Polyline
                coordinates={route.map((point) => ({
                  latitude: point.lat,
                  longitude: point.lng,
                }))}
                strokeColor="#FF6B6B"
                strokeWidth={3}
              />
            )}
          </MapView>
        )}
      </View>

      <View style={styles.bottomSheet}>
        <Text style={styles.title}>Start a Safe Trip</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter destination address"
            value={destination}
            onChangeText={setDestination}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchDestination}
            disabled={loading}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {destinationLocation && route.length > 0 && (
          <View style={styles.routeInfo}>
            <Text style={styles.routeInfoText}>
              ✓ Route calculated successfully
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.startButton,
            (!destinationLocation || loading) && styles.startButtonDisabled,
          ]}
          onPress={handleStartTrip}
          disabled={!destinationLocation || loading}
        >
          <Text style={styles.startButtonText}>
            {loading ? 'Starting Trip...' : '🚕 Start Trip'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  routeInfo: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  routeInfoText: {
    color: '#2E7D32',
    fontSize: 14,
  },
  startButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  startButtonDisabled: {
    backgroundColor: '#FFB3B3',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 14,
  },
});
