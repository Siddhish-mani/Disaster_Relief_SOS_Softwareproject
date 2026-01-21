import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing } from '../theme';

export default function AdminAnalyticsScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>Analytics</Text>
      <Text style={{ color: colors.muted, marginTop: spacing.sm }}>
        Placeholder: integrate charts (e.g., victory-native, react-native-svg-charts)
      </Text>
      <View style={{ height: 180, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.muted }}>Line chart: SOS requests per day</Text>
      </View>
      <View style={{ height: 180, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.muted }}>Pie chart: center occupancy</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
});






