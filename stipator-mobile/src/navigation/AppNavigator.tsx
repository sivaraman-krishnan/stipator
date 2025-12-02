import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { RootStackParamList } from '../types';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TrustedContactsScreen from '../screens/TrustedContactsScreen';
import AddContactScreen from '../screens/AddContactScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WebPlaceholderScreen from '../screens/WebPlaceholderScreen';

// Conditionally import map-dependent screens (not available on web)
let StartTripScreen: any;
let ActiveTripScreen: any;

if (Platform.OS !== 'web') {
  StartTripScreen = require('../screens/StartTripScreen').default;
  ActiveTripScreen = require('../screens/ActiveTripScreen').default;
} else {
  // Use placeholder screens on web
  StartTripScreen = () => <WebPlaceholderScreen featureName="Trip Navigation with Maps" />;
  ActiveTripScreen = () => <WebPlaceholderScreen featureName="Active Trip Monitoring" />;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Stipator...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF6B6B',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {user ? (
          // Authenticated Stack
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Stipator' }}
            />
            <Stack.Screen
              name="TrustedContacts"
              component={TrustedContactsScreen}
              options={{ title: 'Trusted Contacts' }}
            />
            <Stack.Screen
              name="AddContact"
              component={AddContactScreen}
              options={{ title: 'Add Contact' }}
            />
            <Stack.Screen
              name="StartTrip"
              component={StartTripScreen}
              options={{ title: 'Start Trip' }}
            />
            <Stack.Screen
              name="ActiveTrip"
              component={ActiveTripScreen}
              options={{
                title: 'Trip in Progress',
                headerBackVisible: false,
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Settings & Profile' }}
            />
          </>
        ) : (
          // Auth Stack
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
