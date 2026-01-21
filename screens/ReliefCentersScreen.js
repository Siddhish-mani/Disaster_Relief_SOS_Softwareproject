import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { spacing, radius, useTheme } from '../theme';
import MapView, { Marker } from 'react-native-maps';

const DATA = [
  { id: '1', name: 'Central Shelter', type: 'Shelter', capacity: 120, resources: { beds: 60, food: 200, meds: 80 } },
  { id: '2', name: 'City Hospital', type: 'Medical', capacity: 80, resources: { beds: 20, food: 40, meds: 150 } },
  { id: '3', name: 'Community Hall', type: 'Food & Water', capacity: 200, resources: { beds: 10, food: 500, meds: 30 } },
];

function CapacityBar({ used, capacity, colors }) {
  const percent = Math.max(0, Math.min(100, Math.round((used / capacity) * 100)));
  return (
    <View style={[styles.progress, { borderColor: colors.border }]}> 
      <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: percent > 80 ? '#ef4444' : percent > 50 ? '#f59e0b' : '#22c55e' }]} />
    </View>
  );
}

function CenterItem({ item, colors }) {
  const latitude = 28.6139 + Number(item.id) * 0.01;
  const longitude = 77.209 + Number(item.id) * 0.01;
  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };
  const bedsAvailable = item.resources.beds;
  const bedsUsed = Math.max(0, item.capacity - bedsAvailable);
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
      <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.row, { color: colors.muted }]}>Type: <Text style={[styles.value, { color: colors.text }]}>{item.type}</Text></Text>
      <Text style={[styles.row, { color: colors.muted }]}>Capacity: <Text style={[styles.value, { color: colors.text }]}>{item.capacity}</Text></Text>
      <Text style={[styles.row, { color: colors.muted }]}>Occupancy</Text>
      <CapacityBar used={bedsUsed} capacity={item.capacity} colors={colors} />
      <View style={styles.badgesRow}>
        <View style={[styles.badge, { borderColor: colors.border }]}><Text style={{ color: colors.muted }}>Beds: <Text style={{ color: colors.text, fontWeight: '700' }}>{item.resources.beds}</Text></Text></View>
        <View style={[styles.badge, { borderColor: colors.border }]}><Text style={{ color: colors.muted }}>Food: <Text style={{ color: colors.text, fontWeight: '700' }}>{item.resources.food}</Text></Text></View>
        <View style={[styles.badge, { borderColor: colors.border }]}><Text style={{ color: colors.muted }}>Meds: <Text style={{ color: colors.text, fontWeight: '700' }}>{item.resources.meds}</Text></Text></View>
      </View>
      <TouchableOpacity onPress={openDirections} style={[styles.directions, { borderColor: colors.border }]}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Get Directions</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ReliefCentersScreen() {
  const { colors } = useTheme();
  const [typeFilter, setTypeFilter] = useState('all');
  const filtered = useMemo(() => (typeFilter === 'all' ? DATA : DATA.filter((d) => d.type.toLowerCase().includes(typeFilter))), [typeFilter]);
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <MapView
        style={[styles.map, { borderColor: colors.border, borderWidth: 1 }]}
        initialRegion={{
          latitude: 28.6139,
          longitude: 77.2090,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
        pointerEvents="none"
      >
        {filtered.map((c) => (
          <Marker key={c.id} coordinate={{ latitude: 28.6139 + Number(c.id) * 0.01, longitude: 77.209 + Number(c.id) * 0.01 }} title={c.name} description={`${c.type} • Capacity ${c.capacity}`} />
        ))}
      </MapView>
      <View style={styles.filtersRow}> 
        {['all','shelter','medical','food'].map((t) => (
          <TouchableOpacity key={t} onPress={() => setTypeFilter(t)} style={[styles.filterChip, { borderColor: colors.border, backgroundColor: typeFilter === t ? colors.surface : 'transparent' }]}> 
            <Text style={{ color: colors.muted, textTransform: 'capitalize' }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CenterItem item={item} colors={colors} />}
        contentContainerStyle={{ paddingVertical: spacing.md }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  map: {
    height: 220,
    borderRadius: radius.lg,
    marginTop: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  progress: {
    height: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginRight: spacing.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginRight: spacing.sm,
  },
  directions: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  row: {
    fontSize: 14,
    marginTop: 2,
  },
  value: {
    fontWeight: '600',
  },
});


