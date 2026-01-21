import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { useTheme, spacing, radius } from '../theme';
import { useAnnouncements } from '../context/AnnouncementsContext';
import { useRequests } from '../context/RequestsContext';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';

const STATS = [
  { id: 's1', label: 'SOS Requests (today)', value: 24 },
  { id: 's2', label: 'Active Centers', value: 8 },
  { id: 's3', label: 'Resolved Cases', value: 63 },
];

const REQUESTS = [
  { id: 'r1', user: 'User A', status: 'Pending', location: '28.61, 77.20' },
  { id: 'r2', user: 'User B', status: 'Accepted', location: '28.63, 77.22' },
  { id: 'r3', user: 'User C', status: 'Resolved', location: '28.60, 77.18' },
];

export default function AdminDashboardScreen() {
  const { colors } = useTheme();
  const { addAnnouncement } = useAnnouncements();
  const { requests, volunteers, assignVolunteer, resolveRequest } = useRequests();
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddCenterModal, setShowAddCenterModal] = useState(false);
  const [reliefCenters, setReliefCenters] = useState([
    { id: '1', name: 'Central Relief Center', location: 'New Delhi', contact: '+91-11-1234-5678', services: 'Food, Water, Medical', coords: { latitude: 28.6139, longitude: 77.209 } },
    { id: '2', name: 'Emergency Shelter', location: 'Mumbai', contact: '+91-22-2345-6789', services: 'Shelter, Food', coords: { latitude: 19.0760, longitude: 72.8777 } },
  ]);
  const [newCenter, setNewCenter] = useState({
    name: '',
    location: '',
    contact: '',
    services: '',
    latitude: '',
    longitude: ''
  });

  const broadcastEmergency = () => {
    addAnnouncement('Emergency Alert', 'This is a public emergency notice. Please follow instructions and stay safe.');
    Alert.alert('Broadcast sent', 'Emergency announcement has been sent to all users.');
  };

  const addReliefCenter = () => {
    if (!newCenter.name || !newCenter.location || !newCenter.contact || !newCenter.services) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const center = {
      id: Date.now().toString(),
      name: newCenter.name,
      location: newCenter.location,
      contact: newCenter.contact,
      services: newCenter.services,
      coords: {
        latitude: parseFloat(newCenter.latitude) || 28.6139,
        longitude: parseFloat(newCenter.longitude) || 77.209
      }
    };

    setReliefCenters([...reliefCenters, center]);
    setNewCenter({ name: '', location: '', contact: '', services: '', latitude: '', longitude: '' });
    setShowAddCenterModal(false);
    Alert.alert('Success', 'Relief center added successfully!');
  };

  const openAddCenterModal = () => {
    setShowAddCenterModal(true);
  };

  const stats = useMemo(() => {
    const total = requests.length;
    const active = requests.filter((r) => r.status !== 'Resolved').length;
    const resolved = requests.filter((r) => r.status === 'Resolved').length;
    const centers = reliefCenters.length;
    return { total, active, resolved, centers };
  }, [requests, reliefCenters]);

  const filtered = useMemo(() => {
    if (priorityFilter === 'all') return requests;
    return requests.filter((r) => r.urgency === priorityFilter);
  }, [requests, priorityFilter]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg }}> 
      <TouchableOpacity onPress={broadcastEmergency} style={[styles.broadcastBtn, { backgroundColor: '#ef4444' }]}> 
        <Text style={{ color: 'white', fontWeight: '800' }}>Emergency Broadcast</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#1e293b', borderColor: colors.border }]}> 
          <Text style={{ color: colors.muted, fontSize: 12 }}>Total SOS</Text>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{stats.total}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#7f1d1d', borderColor: colors.border }]}> 
          <Text style={{ color: '#fecaca', fontSize: 12 }}>Active</Text>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '800', marginTop: 4 }}>{stats.active}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#064e3b', borderColor: colors.border }]}> 
          <Text style={{ color: '#bbf7d0', fontSize: 12 }}>Resolved</Text>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '800', marginTop: 4 }}>{stats.resolved}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#1e3a8a', borderColor: colors.border }]}> 
          <Text style={{ color: '#bfdbfe', fontSize: 12 }}>Centers</Text>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '800', marginTop: 4 }}>{stats.centers}</Text>
        </View>
      </View>

      <View style={styles.quickRow}>
        <TouchableOpacity onPress={openAddCenterModal} style={[styles.quickBtn, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#0b1220', fontWeight: '800' }}>Add Relief Center</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#f59e0b' }]}>
          <Text style={{ color: '#0b1220', fontWeight: '800' }}>View Pending SOS</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Incoming Requests</Text>
      <View style={styles.filtersRow}>
        {['all','high','medium','low'].map((p) => (
          <TouchableOpacity key={p} onPress={() => setPriorityFilter(p)} style={[styles.filterChip, { borderColor: colors.border, backgroundColor: priorityFilter === p ? colors.surface : 'transparent' }]}> 
            <Text style={{ color: colors.muted, textTransform: 'capitalize' }}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[styles.table, { borderColor: colors.border }]}> 
        <View style={[styles.tr, { backgroundColor: colors.surface }]}> 
          <Text style={[styles.th, { color: colors.muted }]}>Urgency</Text>
          <Text style={[styles.th, { color: colors.muted }]}>Resource</Text>
          <Text style={[styles.th, { color: colors.muted }]}>Location</Text>
          <Text style={[styles.th, { color: colors.muted }]}>Status</Text>
          <Text style={[styles.th, { color: colors.muted }]}>Action</Text>
        </View>
        {filtered.length === 0 ? (
          <View style={[styles.tr, { padding: spacing.lg, alignItems: 'center' }]}>
            <Text style={{ color: colors.muted }}>No requests found</Text>
          </View>
        ) : (
          filtered.map((r) => (
            <View key={r.id} style={[styles.tr, { borderTopColor: colors.border, borderTopWidth: 1 }]}> 
              <Text style={[styles.td, { color: r.urgency === 'high' ? '#f87171' : colors.text }]}>{r.urgency}</Text>
              <Text style={[styles.td, { color: colors.text }]}>{r.resource}</Text>
              <Text style={[styles.td, { color: colors.muted }]}>{r.coords ? `${r.coords.latitude.toFixed(3)}, ${r.coords.longitude.toFixed(3)}` : '-'}</Text>
              <Text style={[styles.td, { color: colors.text }]}>{r.status}</Text>
              <View style={[styles.td, { flexDirection: 'row' }]}> 
                {volunteers.map((v) => (
                  <TouchableOpacity key={v.id} onPress={() => assignVolunteer(r.id, v.id)} style={[styles.smallBtn, { backgroundColor: colors.primary }]}>
                    <Text style={{ color: '#0b1220', fontWeight: '800' }}>{v.name}</Text>
                  </TouchableOpacity>
                ))}
                {r.status !== 'Resolved' && (
                  <TouchableOpacity onPress={() => resolveRequest(r.id)} style={[styles.smallBtn, { backgroundColor: '#22c55e' }]}>
                    <Text style={{ color: '#0b1220', fontWeight: '800' }}>Resolve</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Map View</Text>
      <MapView
        style={{ height: 220, borderRadius: 12, marginTop: spacing.sm }}
        initialRegion={{ latitude: 28.6139, longitude: 77.209, latitudeDelta: 0.2, longitudeDelta: 0.2 }}
      >
        {requests.filter((r) => r.coords).map((r) => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.coords.latitude, longitude: r.coords.longitude }}
            pinColor={r.status === 'Resolved' ? 'green' : 'red'}
            title={`${r.resource} (${r.urgency})`}
          />
        ))}
      </MapView>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Relief Centers</Text>
      <View style={[styles.centerBar, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <TextInput placeholder="Search centers" placeholderTextColor={colors.muted} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
        <TouchableOpacity onPress={openAddCenterModal} style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#0b1220', fontWeight: '800' }}>Add Center</Text>
        </TouchableOpacity>
      </View>
      
      {reliefCenters.map((center) => (
        <View key={center.id} style={[styles.centerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.centerName, { color: colors.text }]}>{center.name}</Text>
          <Text style={[styles.centerLocation, { color: colors.muted }]}>{center.location}</Text>
          <Text style={[styles.centerContact, { color: colors.muted }]}>{center.contact}</Text>
          <Text style={[styles.centerServices, { color: colors.text }]}>Services: {center.services}</Text>
        </View>
      ))}

      {/* Add Relief Center Modal */}
      <Modal visible={showAddCenterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Relief Center</Text>
              <TouchableOpacity onPress={() => setShowAddCenterModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="Center Name"
                placeholderTextColor={colors.muted}
                value={newCenter.name}
                onChangeText={(text) => setNewCenter({...newCenter, name: text})}
              />
              
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="Location"
                placeholderTextColor={colors.muted}
                value={newCenter.location}
                onChangeText={(text) => setNewCenter({...newCenter, location: text})}
              />
              
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="Contact Number"
                placeholderTextColor={colors.muted}
                value={newCenter.contact}
                onChangeText={(text) => setNewCenter({...newCenter, contact: text})}
                keyboardType="phone-pad"
              />
              
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="Services (e.g., Food, Water, Medical)"
                placeholderTextColor={colors.muted}
                value={newCenter.services}
                onChangeText={(text) => setNewCenter({...newCenter, services: text})}
              />
              
              <View style={styles.coordsRow}>
                <TextInput
                  style={[styles.modalInputHalf, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="Latitude"
                  placeholderTextColor={colors.muted}
                  value={newCenter.latitude}
                  onChangeText={(text) => setNewCenter({...newCenter, latitude: text})}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.modalInputHalf, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="Longitude"
                  placeholderTextColor={colors.muted}
                  value={newCenter.longitude}
                  onChangeText={(text) => setNewCenter({...newCenter, longitude: text})}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>
            
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowAddCenterModal(false)} style={[styles.modalBtn, styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addReliefCenter} style={[styles.modalBtn, styles.addBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: '#0b1220', fontWeight: '800' }}>Add Center</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    marginRight: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  quickRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    fontSize: 16,
    fontWeight: '700',
  },
  filtersRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  filterChip: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    marginRight: spacing.sm,
  },
  table: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  tr: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  th: {
    flex: 1,
    fontWeight: '700',
  },
  td: {
    flex: 1,
  },
  centerBar: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginRight: spacing.sm,
  },
  actionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  broadcastBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  smallBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  centerCard: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  centerLocation: {
    fontSize: 14,
    marginBottom: 2,
  },
  centerContact: {
    fontSize: 14,
    marginBottom: 4,
  },
  centerServices: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: spacing.md,
    maxHeight: 400,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 16,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalInputHalf: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  addBtn: {
    // backgroundColor set dynamically
  },
});


