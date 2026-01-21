import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity, Linking } from 'react-native';
import { spacing, radius, useTheme } from '../theme';
import MapView, { Marker } from 'react-native-maps';

export default function SendSOSScreen() {
  const { colors, typography } = useTheme();
  const [message, setMessage] = useState('');

  const mockLocation = {
    latitude: 28.6139,
    longitude: 77.2090,
  };

  const onSend = () => {
    Alert.alert('SOS Sent!', `Location: ${mockLocation.latitude}, ${mockLocation.longitude}\nMessage: ${message || 'N/A'}`);
    setMessage('');
  };

  const callEmergency = async () => {
    const emergencyNumber = '911';
    const url = `tel:${emergencyNumber}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        console.log('Successfully opened phone dialer for 911');
      } else {
        Alert.alert('Unable to place call', 'Calling is not supported on this device. Please call 911 manually.');
      }
    } catch (err) {
      console.error('Failed to open phone dialer:', err);
      Alert.alert('Error', 'Unable to open phone dialer. Please call 911 manually.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[typography.label]}>Your Location (mocked):</Text>
      <MapView
        style={[styles.map, { borderColor: colors.border }]}
        initialRegion={{
          latitude: mockLocation.latitude,
          longitude: mockLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        pointerEvents="none"
      >
        <Marker coordinate={mockLocation} title="You" description="Mocked location" />
      </MapView>
      <Text style={{ marginTop: 4, fontSize: 16, color: colors.muted }}>{mockLocation.latitude}, {mockLocation.longitude}</Text>
      <Text style={[typography.label, { marginTop: spacing.md }]}>Optional Message:</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        placeholder="Type a short message..."
        placeholderTextColor={colors.muted}
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <View style={{ marginTop: spacing.sm }}>
        <Button title="Send SOS" onPress={onSend} color={colors.primaryDark} />
      </View>

      <TouchableOpacity onPress={callEmergency} style={[styles.sosButton, { backgroundColor: '#DC2626', shadowColor: '#DC2626' }]}> 
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>SOS CALL 911</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  map: {
    height: 180,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  sosButton: {
    marginTop: spacing.lg,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
});


