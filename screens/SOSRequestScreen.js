import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme, spacing, radius } from '../theme';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useRequests } from '../context/RequestsContext';

export default function SOSRequestScreen({ route }) {
  const { colors } = useTheme();
  const { addEntry } = useRequests();
  const [message, setMessage] = useState('');
  const [resource, setResource] = useState('medical');
  const [urgency, setUrgency] = useState('high');
  const [coords, setCoords] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('Pending');
  const [loadingLoc, setLoadingLoc] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // Get username from route params or AsyncStorage
        const routeUsername = route?.params?.username;
        if (routeUsername) {
          setUsername(routeUsername);
        } else {
          // Try to get from AsyncStorage if available
          const storedUsername = await AsyncStorage.getItem('username');
          if (storedUsername) {
            setUsername(storedUsername);
          }
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        }
      } catch (e) {
        // ignore demo
      } finally {
        setLoadingLoc(false);
      }
    })();
  }, [route]);

  const submit = async () => {
    if (!coords) {
      Alert.alert('Error', 'Please wait for location to be determined');
      return;
    }

    setSubmitting(true);
    setStatus('Pending');
    
    try {
      const isConnected = (await NetInfo.fetch()).isConnected;
      
      // Format location as string for database
      const locationStr = `${coords.latitude}, ${coords.longitude}`;
      
      // Create message combining resource, urgency, and user message
      const fullMessage = `Resource: ${resource}, Urgency: ${urgency}${message ? `, Details: ${message}` : ''}`;
      
      // Prepare database entry
      const dbEntry = {
        name: username || 'Anonymous',
        message: fullMessage,
        location: locationStr,
        contact: null, // Can be added later if needed
      };

      if (!isConnected) {
        // Store offline for later sync
        const existing = JSON.parse((await AsyncStorage.getItem('offline_sos_queue')) || '[]');
        existing.push({ ...dbEntry, coords, resource, urgency, createdAt: Date.now() });
        await AsyncStorage.setItem('offline_sos_queue', JSON.stringify(existing));
        Alert.alert('Queued', 'SOS request queued. Will be sent when connection is restored.');
        setSubmitting(false);
        return;
      }

      // Create database entry via API
      await addEntry(dbEntry);
      
      Alert.alert('Success', 'SOS request has been sent and saved to database!');
      
      // Update status
      setTimeout(() => setStatus('Accepted'), 1200);
      setTimeout(() => { 
        setStatus('Resolved'); 
        setSubmitting(false);
        // Clear form
        setMessage('');
      }, 2800);
    } catch (error) {
      console.error('Error submitting SOS:', error);
      Alert.alert('Error', `Failed to send SOS: ${error.message}`);
      setSubmitting(false);
      setStatus('Pending');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.label, { color: colors.text }]}>Location</Text>
      {loadingLoc ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          value={coords ? `${coords.latitude}, ${coords.longitude}` : ''}
          onChangeText={() => {}}
          editable={false}
        />
      )}

      <Text style={[styles.label, { color: colors.text }]}>Needed Resource</Text>
      <View style={[styles.pickerWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
        <Picker selectedValue={resource} onValueChange={(v) => setResource(v)} dropdownIconColor={colors.muted} style={{ color: colors.text }}>
          <Picker.Item label="Medical" value="medical" />
          <Picker.Item label="Food" value="food" />
          <Picker.Item label="Water" value="water" />
          <Picker.Item label="Shelter" value="shelter" />
        </Picker>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Urgency</Text>
      <View style={[styles.pickerWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
        <Picker selectedValue={urgency} onValueChange={(v) => setUrgency(v)} dropdownIconColor={colors.muted} style={{ color: colors.text }}>
          <Picker.Item label="High" value="high" />
          <Picker.Item label="Medium" value="medium" />
          <Picker.Item label="Low" value="low" />
        </Picker>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Message (optional)</Text>
      <TextInput
        style={[styles.textarea, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
        placeholder="Brief description..."
        placeholderTextColor={colors.muted}
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <View style={{ marginTop: spacing.md }}>
        <Button title={submitting ? 'Submitting...' : 'Submit SOS'} disabled={submitting} onPress={submit} color={colors.primary} />
      </View>
      <Text style={{ color: colors.muted, marginTop: 6 }}>
        Tip: Works offline. Requests are queued and auto-sent when online.
      </Text>

      <View style={[styles.timeline, { borderColor: colors.border }]}> 
        {['Pending', 'Accepted', 'Resolved'].map((s) => (
          <View key={s} style={styles.step}>
            <View style={[styles.dot, { backgroundColor: s === status || (status === 'Resolved' && s !== 'Pending') ? colors.primary : colors.border }]} />
            <Text style={{ color: colors.muted, marginTop: 6 }}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  pickerWrap: {
    borderWidth: 1,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  timeline: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});


