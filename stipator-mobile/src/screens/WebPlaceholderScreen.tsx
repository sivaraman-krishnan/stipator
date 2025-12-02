import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WebPlaceholderScreenProps {
  featureName: string;
}

export default function WebPlaceholderScreen({ featureName }: WebPlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌐 Web Version</Text>
      <Text style={styles.message}>
        {featureName} requires native device features and is only available on mobile devices.
      </Text>
      <Text style={styles.hint}>
        Please use the Expo Go app on your iOS or Android device to access this feature.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FF6B6B',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    color: '#666',
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
});
