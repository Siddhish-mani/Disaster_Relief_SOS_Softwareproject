import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useTheme, spacing, radius } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation, route }) {
  const { colors } = useTheme();
  const [coords, setCoords] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(true);
  const username = route?.params?.username || '';

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoadingLoc(false);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch (e) {
        // ignore for demo
      } finally {
        setLoadingLoc(false);
      }
    })();
  }, []);

  const openDirections = () => {
    if (!coords) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Emergency Status Cards */}
      <View style={styles.statusCards}>
        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="emergency" size={24} color="#ef4444" />
          <Text style={[styles.statusText, { color: colors.text }]}>Emergency Ready</Text>
        </View>
        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="location-on" size={24} color="#10b981" />
          <Text style={[styles.statusText, { color: colors.text }]}>Location Active</Text>
        </View>
      </View>

      {/* Main SOS Button - Bigger and Centered */}
      <View style={styles.sosContainer}>
        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={async () => {
            console.log('SOS button pressed - calling 112');
            try {
              const supported = await Linking.canOpenURL('tel:112');
              if (supported) {
                await Linking.openURL('tel:112');
                console.log('Successfully opened phone dialer for 112');
              } else {
                alert('Unable to place call. Please call 112 manually.');
              }
            } catch (err) {
              console.error('Failed to open phone dialer:', err);
              alert('Unable to open phone dialer. Please call 112 manually.');
            }
          }} 
          style={styles.sosCircle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="emergency" size={50} color="white" />
          <Text style={styles.sosText}>EMERGENCY</Text>
        </TouchableOpacity>
        
        {/* Pulsing Ring Effect */}
        <View style={styles.pulseRing} />
        <View style={[styles.pulseRing, styles.pulseRing2]} />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={() => navigation.navigate('SOSRequest', { username })}
          >
            <LinearGradient colors={["#f97316", "#ea580c"]} style={styles.quickIcon}>
              <MaterialIcons name="send" size={20} color="white" />
            </LinearGradient>
            <Text style={[styles.quickText, { color: colors.text }]}>Send SOS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={() => navigation.navigate('UserChat')}
          >
            <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.quickIcon}>
              <MaterialIcons name="chat" size={20} color="white" />
            </LinearGradient>
            <Text style={[styles.quickText, { color: colors.text }]}>Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={() => navigation.navigate('ReliefCenters')}
          >
            <LinearGradient colors={["#10b981", "#059669"]} style={styles.quickIcon}>
              <MaterialIcons name="local-hospital" size={20} color="white" />
            </LinearGradient>
            <Text style={[styles.quickText, { color: colors.text }]}>Relief Centers</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Location Section */}
      <View style={styles.locationSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Location</Text>
        <View style={[styles.mapContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {loadingLoc ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.loadingText, { color: colors.muted }]}>Getting your location...</Text>
            </View>
          ) : coords ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={coords} title="Your Location">
                <View style={styles.customMarker}>
                  <MaterialIcons name="my-location" size={24} color="#ef4444" />
                </View>
              </Marker>
            </MapView>
          ) : (
            <View style={styles.errorContainer}>
              <MaterialIcons name="location-off" size={48} color={colors.muted} />
              <Text style={[styles.errorText, { color: colors.muted }]}>Location permission denied</Text>
              <Text style={[styles.errorSubText, { color: colors.muted }]}>Enable location access for better emergency response</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          onPress={openDirections} 
          style={[styles.directions, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <MaterialIcons name="directions" size={20} color={colors.primary} />
          <Text style={[styles.directionsText, { color: colors.text }]}>Open in Google Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Tips */}
      <View style={styles.tipsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Tips</Text>
        <View style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="lightbulb-outline" size={24} color="#f59e0b" />
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: colors.text }]}>Stay Safe</Text>
            <Text style={[styles.tipText, { color: colors.muted }]}>
              Keep your phone charged and location services enabled for faster emergency response.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  
  // Status Cards
  statusCards: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  statusCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // SOS Button Section
  sosContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  sosCircle: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
    zIndex: 10, // Ensure button is above other elements
  },
  sosText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  sosSubText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  
  // Pulsing Ring Effect
  pulseRing: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    borderWidth: 2,
    borderColor: '#ef4444',
    opacity: 0.3,
    pointerEvents: 'none', // Prevent interference with touch events
  },
  pulseRing2: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    opacity: 0.2,
    pointerEvents: 'none', // Prevent interference with touch events
  },

  // Quick Actions
  quickActionsContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Location Section
  locationSection: {
    marginBottom: spacing.xl,
  },
  mapContainer: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  map: {
    height: 200,
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    textAlign: 'center',
  },
  customMarker: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  directions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  directionsText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Tips Section
  tipsSection: {
    marginBottom: spacing.xl,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});


