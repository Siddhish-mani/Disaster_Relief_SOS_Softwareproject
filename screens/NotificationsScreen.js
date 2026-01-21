import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, radius, useTheme } from '../theme';
import { useAnnouncements } from '../context/AnnouncementsContext';

const STATIC_ALERTS = [
  { id: 'n_static_1', title: 'Weather Alert', body: 'Heavy rainfall expected in your area.' },
  { id: 'n_static_2', title: 'Safety Tip', body: 'Carry essential medicines and water.' },
];

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { announcements } = useAnnouncements();
  const data = [
    ...announcements.map((a) => ({ ...a, _type: 'announcement' })),
    ...STATIC_ALERTS.map((a) => ({ ...a, _type: 'static' })),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <MaterialIcons name={item._type === 'announcement' ? 'campaign' : 'notifications'} size={22} color={colors.primary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.body, { color: colors.muted }]}>{item.body}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingVertical: spacing.md }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  body: {
    fontSize: 13,
    marginTop: 2,
  },
});
