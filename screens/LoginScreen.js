import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { spacing, radius, useTheme } from '../theme';

export default function LoginScreen({ navigation }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [role, setRole] = useState('User');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();

  // Determine base URL
  // 1) If provided in app config (app.json -> expo.extra.apiUrl), use that
  // 2) Otherwise, default to emulator-friendly addresses
  const configuredUrl = (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.apiUrl)
    || (Constants.manifest && Constants.manifest.extra && Constants.manifest.extra.apiUrl);
  const BASE_URL = configuredUrl || Platform.select({
    android: 'http://10.0.2.2:4000', // Android emulator loopback to host
    ios: 'http://localhost:4000',    // iOS simulator
    default: 'http://localhost:4000',
  });

  const onSignup = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    let timeoutId = null;
    const controller = new AbortController();

    try {
      console.log('Signup attempt to:', `${BASE_URL}/api/auth/signup`);
      timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
        signal: controller.signal,
      });
      
      if (timeoutId) clearTimeout(timeoutId);

      console.log('Signup response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Server error' }));
        setError(errorData.error || `Server error: ${res.status}`);
        return;
      }

      const data = await res.json();
      console.log('Signup response data:', data);

      if (data.success) {
        setError('');
        // Switch to login mode after successful signup
        setMode('login');
        Alert.alert('Success', 'Account created! Please login.');
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error('Signup error:', err);
      if (err.name === 'AbortError') {
        setError(`Connection timeout. Check: 1) Same Wi-Fi? 2) Firewall? 3) IP correct? (${BASE_URL})`);
      } else {
        setError(`Network error: ${err.message}. Check: 1) Backend running? 2) Correct IP? (${BASE_URL})`);
      }
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    setError('');
    let timeoutId = null;
    const controller = new AbortController();

    try {
      console.log('Login attempt to:', `${BASE_URL}/api/auth/login`);
      timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
        signal: controller.signal,
      });
      
      if (timeoutId) clearTimeout(timeoutId);

      console.log('Login response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Server error' }));
        setError(errorData.message || `Server error: ${res.status}`);
        return;
      }

      const data = await res.json();
      console.log('Login response data:', data);

      if (data.success) {
        navigation.replace('Dashboard', { role, username });
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error('Login error:', err);
      if (err.name === 'AbortError') {
        setError(`Connection timeout. Check: 1) Same Wi-Fi? 2) Firewall? 3) IP correct? (${BASE_URL})`);
      } else {
        setError(`Network error: ${err.message}. Check: 1) Backend running? 2) Correct IP? (${BASE_URL})`);
      }
    } finally {
      setLoading(false);
    }
  };

  const callHelpline = () => Linking.openURL('tel:112');

  const testConnection = async () => {
    setError('');
    
    try {
      // First, check network connectivity
      const netInfo = await NetInfo.fetch();
      console.log('Network info:', {
        isConnected: netInfo.isConnected,
        type: netInfo.type,
        isInternetReachable: netInfo.isInternetReachable,
        details: netInfo.details,
      });

      if (!netInfo.isConnected) {
        Alert.alert(
          '❌ No Network Connection',
          'Your device is not connected to any network.\n\nPlease connect to Wi-Fi or mobile data and try again.'
        );
        setLoading(false);
        return;
      }

      // Check if using mobile data (cellular)
      const isMobileData = netInfo.type === 'cellular';
      const isLocalIP = BASE_URL.includes('192.168.') || BASE_URL.includes('10.0.2.2') || BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1');

      if (isMobileData && isLocalIP) {
        Alert.alert(
          '📱 Mobile Data Detected',
          `You're connected via mobile data (cellular), but trying to connect to a local IP address:\n\n${BASE_URL}\n\nLocal IPs (192.168.x.x) only work on the same Wi-Fi network.\n\nSolutions:\n\n✅ Option 1: Use Wi-Fi Hotspot (Easiest)\n1. Turn on Wi-Fi hotspot on your phone\n2. Connect your computer to phone's hotspot\n3. Find computer's IP: ipconfig\n4. Update app.json with that IP\n\n✅ Option 2: Use ngrok (Public URL)\n1. Install: npm install -g ngrok\n2. Run: ngrok http 4000\n3. Copy the https URL (e.g., https://abc123.ngrok.io)\n4. Update app.json: "apiUrl": "https://abc123.ngrok.io"\n\n✅ Option 3: Connect to Wi-Fi\nConnect both devices to the same Wi-Fi network.\n\nSee MOBILE_DATA_SETUP.md for detailed instructions.`,
          [
            { text: 'OK', style: 'default' },
            { text: 'Continue Anyway', onPress: () => testConnectionActual() }
          ]
        );
        setLoading(false);
        return;
      }

      testConnectionActual();
    } catch (err) {
      setLoading(false);
      Alert.alert('❌ Error', `Failed to check network: ${err.message}`);
    }
  };

  const testConnectionActual = async () => {
    setLoading(true);
    let timeoutId = null;
    const controller = new AbortController();
    
    try {
      const netInfo = await NetInfo.fetch();
      console.log('Testing connection to:', BASE_URL);
      timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000); // 15 second timeout
      
      const startTime = Date.now();
      const res = await fetch(`${BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      const responseTime = Date.now() - startTime;
      
      if (timeoutId) clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        Alert.alert(
          '✅ Connection Success!',
          `Backend is reachable at:\n${BASE_URL}\n\nStatus: ${data.status}\nResponse time: ${responseTime}ms\n\nNetwork: ${netInfo.type}${netInfo.details?.ssid ? ` (${netInfo.details.ssid})` : ''}`
        );
      } else {
        Alert.alert('❌ Connection Failed', `Server returned status: ${res.status}\n\nURL: ${BASE_URL}`);
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      
      const netInfo = await NetInfo.fetch();
      const networkInfo = netInfo.isConnected 
        ? `Network: ${netInfo.type}${netInfo.details?.ssid ? ` (${netInfo.details.ssid})` : ''}`
        : 'No network connection';
      
      const isMobileData = netInfo.type === 'cellular';
      const isLocalIP = BASE_URL.includes('192.168.') || BASE_URL.includes('10.0.2.2') || BASE_URL.includes('localhost');
      
      if (err.name === 'AbortError') {
        console.error('Connection test error:', err);
        
        let troubleshooting = '';
        if (isMobileData && isLocalIP) {
          troubleshooting = `📱 MOBILE DATA ISSUE:\n\nYou're on mobile data trying to access a local IP.\n\nSolutions:\n\n1. Wi-Fi Hotspot:\n   • Enable hotspot on your phone\n   • Connect computer to hotspot\n   • Update IP in app.json\n\n2. Use ngrok:\n   • Install: npm install -g ngrok\n   • Run: ngrok http 4000\n   • Use the https URL in app.json\n\n3. Connect to Wi-Fi:\n   • Both devices on same Wi-Fi\n\nSee MOBILE_DATA_SETUP.md for details.`;
        } else {
          troubleshooting = `Troubleshooting Steps:\n\n1. Check if backend server is running:\n   • Open terminal in server folder\n   • Run: npm start (or node server/src/index.js)\n   • Look for: "API listening on port 4000"\n\n2. Verify IP address:\n   • On Windows: ipconfig\n   • Look for IPv4 Address (usually 192.168.x.x)\n   • Update app.json with correct IP\n\n3. Check Windows Firewall:\n   • Windows Security → Firewall\n   • Allow Node.js through firewall\n   • Or temporarily disable firewall to test\n\n4. Same Wi-Fi network:\n   • Device and computer must be on same Wi-Fi\n   • Mobile data won't work for local IPs\n\n5. Test in browser:\n   • Open: ${BASE_URL}/health\n   • Should show: {"status":"ok"}`;
        }
        
        Alert.alert(
          '⏱️ Connection Timeout',
          `Could not reach ${BASE_URL} after 15 seconds.\n\n${networkInfo}\n\n${troubleshooting}`
        );
      } else {
        console.error('Connection test error:', err);
        
        let troubleshooting = '';
        if (isMobileData && isLocalIP) {
          troubleshooting = `📱 On mobile data - local IPs won't work!\n\nUse:\n1. Wi-Fi hotspot, or\n2. ngrok (npm install -g ngrok)\n3. Connect to Wi-Fi\n\nSee MOBILE_DATA_SETUP.md`;
        } else {
          troubleshooting = `Troubleshooting:\n1. Is backend server running?\n2. Check IP address in app.json\n3. Same Wi-Fi network?\n4. Firewall blocking connection?\n\nTest in browser: ${BASE_URL}/health`;
        }
        
        Alert.alert(
          '❌ Connection Error',
          `Cannot reach ${BASE_URL}\n\n${networkInfo}\n\nError: ${err.message}\n\n${troubleshooting}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.hero}>
        <View style={[styles.logoCircle, { backgroundColor: '#111827', borderColor: colors.border }]}> 
          <MaterialIcons name="campaign" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Disaster Relief SOS</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Send SOS, get help fast, and find nearby relief centers</Text>
      </View>

      <View style={styles.featuresRow}>
        <View style={[styles.feature, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
          <MaterialIcons name="emergency" size={22} color={colors.primary} />
          <Text style={[styles.featureText, { color: colors.text }]}>Instant SOS</Text>
        </View>
        <View style={[styles.feature, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
          <MaterialIcons name="map" size={22} color={colors.primary} />
          <Text style={[styles.featureText, { color: colors.text }]}>Relief Centers</Text>
        </View>
        <View style={[styles.feature, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
          <MaterialIcons name="chat" size={22} color={colors.primary} />
          <Text style={[styles.featureText, { color: colors.text }]}>Chat & Updates</Text>
        </View>
      </View>

      <View style={[styles.segmented, { backgroundColor: '#0f1629', borderColor: '#1F2937', borderWidth: 1 }]}> 
        <TouchableOpacity
          style={[styles.segmentButton, mode === 'login' && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => {
            setMode('login');
            setError('');
          }}
        >
          <Text style={[styles.segmentText, { color: mode === 'login' ? colors.text : colors.muted }]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, mode === 'signup' && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => {
            setMode('signup');
            setError('');
          }}
        >
          <Text style={[styles.segmentText, { color: mode === 'signup' ? colors.text : colors.muted }]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.segmented, { backgroundColor: '#0f1629', borderColor: '#1F2937', borderWidth: 1, marginTop: spacing.sm }]}> 
        <TouchableOpacity
          style={[styles.segmentButton, role === 'User' && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => {
            setRole('User');
            setError('');
          }}
        >
          <Text style={[styles.segmentText, { color: role === 'User' ? colors.text : colors.muted }]}>User</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, role === 'Admin' && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => {
            setRole('Admin');
            setError('');
          }}
        >
          <Text style={[styles.segmentText, { color: role === 'Admin' ? colors.text : colors.muted }]}>Admin</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          testID="username-input"
          accessibilityLabel="Username"
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Username"
          placeholderTextColor={colors.muted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!loading}
        />
        <TextInput
          testID="password-input"
          accessibilityLabel="Password"
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
          onSubmitEditing={mode === 'login' ? onLogin : onSignup}
        />
        {mode === 'login' && role === 'Admin' && (
          <Text style={[styles.hint, { color: colors.muted }]}>Default: admin / admin123</Text>
        )}
        {mode === 'signup' && (
          <Text style={[styles.hint, { color: colors.muted }]}>Username: min 3 chars, Password: min 6 chars</Text>
        )}
        {error ? <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text> : null}
      </View>

      <TouchableOpacity 
        testID={mode === 'login' ? 'login-button' : 'signup-button'}
        onPress={mode === 'login' ? onLogin : onSignup} 
        activeOpacity={0.9} 
        disabled={loading}
        style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}> 
        {loading ? (
          <ActivityIndicator color="#0b1220" />
        ) : (
          <Text style={styles.primaryBtnText}>{mode === 'login' ? 'Login' : 'Sign Up'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={testConnection} 
        disabled={loading}
        style={[styles.testBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
        <MaterialIcons name="wifi" size={18} color={colors.text} />
        <Text style={[styles.testBtnText, { color: colors.text }]}>Test Connection</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={callHelpline} style={[styles.helplineBtn, { borderColor: colors.border }]}> 
        <MaterialIcons name="call" size={18} color={colors.text} />
        <Text style={[styles.helplineText, { color: colors.text }]}>Emergency Helpline 112</Text>
      </TouchableOpacity>

      <Text style={[styles.disclaimer, { color: colors.muted }]}>By continuing, you agree to receive critical alerts during emergencies.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  featuresRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  feature: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  featureText: {
    marginTop: 6,
    fontWeight: '700',
    fontSize: 12,
  },
  segmented: {
    flexDirection: 'row',
    padding: spacing.xs,
    borderRadius: radius.md,
    width: '100%',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  segmentText: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryBtn: {
    marginTop: spacing.lg,
    width: '100%',
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#0b1220',
    fontWeight: '800',
    fontSize: 16,
  },
  helplineBtn: {
    marginTop: spacing.sm,
    width: '100%',
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  helplineText: {
    marginLeft: 8,
    fontWeight: '700',
  },
  disclaimer: {
    marginTop: spacing.sm,
    fontSize: 12,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  testBtn: {
    marginTop: spacing.md,
    width: '100%',
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  testBtnText: {
    marginLeft: 8,
    fontWeight: '700',
  },
});


