import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

const DEVIATION_PRESETS = {
  high: { value: 200, label: 'High Sensitivity', description: 'Dense urban areas' },
  medium: { value: 500, label: 'Medium Sensitivity', description: 'Balanced (Recommended)' },
  low: { value: 800, label: 'Low Sensitivity', description: 'Highways, rural areas' },
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [deviationThreshold, setDeviationThreshold] = useState(500);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setUserEmail(user.email || '');

      // Load user profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.name || '');
        setDeviationThreshold(userData.deviationThreshold || 500);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await setDoc(
        doc(db, 'users', user.uid),
        { deviationThreshold },
        { merge: true }
      );

      setSaveSuccess(true);
      Alert.alert('Success', 'Settings saved successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (preset: keyof typeof DEVIATION_PRESETS) => {
    setDeviationThreshold(DEVIATION_PRESETS[preset].value);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  const getSelectedPreset = () => {
    if (deviationThreshold === DEVIATION_PRESETS.high.value) return 'high';
    if (deviationThreshold === DEVIATION_PRESETS.medium.value) return 'medium';
    if (deviationThreshold === DEVIATION_PRESETS.low.value) return 'low';
    return 'custom';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{userName}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{userEmail}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Sensitivity</Text>
        <Text style={styles.sectionDescription}>
          How far from the expected route before triggering alerts
        </Text>

        <View style={styles.presetContainer}>
          {Object.entries(DEVIATION_PRESETS).map(([key, preset]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.presetButton,
                getSelectedPreset() === key && styles.presetButtonActive,
              ]}
              onPress={() => handlePresetSelect(key as keyof typeof DEVIATION_PRESETS)}
            >
              <Text
                style={[
                  styles.presetLabel,
                  getSelectedPreset() === key && styles.presetLabelActive,
                ]}
              >
                {preset.label}
              </Text>
              <Text
                style={[
                  styles.presetDescription,
                  getSelectedPreset() === key && styles.presetDescriptionActive,
                ]}
              >
                {preset.description}
              </Text>
              <Text
                style={[
                  styles.presetValue,
                  getSelectedPreset() === key && styles.presetValueActive,
                ]}
              >
                {preset.value}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Custom Threshold: {deviationThreshold}m</Text>
          <Slider
            style={styles.slider}
            minimumValue={200}
            maximumValue={1000}
            step={50}
            value={deviationThreshold}
            onValueChange={setDeviationThreshold}
            minimumTrackTintColor="#FF6B6B"
            maximumTrackTintColor="#DDD"
            thumbTintColor="#FF6B6B"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderEndLabel}>200m (Sensitive)</Text>
            <Text style={styles.sliderEndLabel}>1000m (Relaxed)</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            💡 Lower values (200-400m) are better for dense urban areas. Higher
            values (600-1000m) are better for highways and rural areas where GPS
            accuracy may vary.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            loading && styles.saveButtonDisabled,
            saveSuccess && styles.saveButtonSuccess,
          ]}
          onPress={handleSaveSettings}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : saveSuccess ? '✓ Settings Saved!' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
        
        {saveSuccess && (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>
              ✓ Your settings have been saved successfully
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>Stipator v1.0.0</Text>
          <Text style={styles.aboutSubtext}>Stay Safe, Stay Connected</Text>
          <Text style={styles.aboutSubtext}>
            Emergency alert system for safer travels
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Built with ❤️ for safety</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  presetContainer: {
    marginBottom: 20,
  },
  presetButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  presetButtonActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  presetLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  presetLabelActive: {
    color: '#FF6B6B',
  },
  presetDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  presetDescriptionActive: {
    color: '#FF6B6B',
  },
  presetValue: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  presetValueActive: {
    color: '#FF6B6B',
  },
  sliderContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderEndLabel: {
    fontSize: 11,
    color: '#999',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#FFB3B3',
  },
  saveButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successBanner: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  successBannerText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  aboutSubtext: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
