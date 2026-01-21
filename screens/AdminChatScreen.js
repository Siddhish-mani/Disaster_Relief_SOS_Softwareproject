import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { spacing, radius, useTheme } from '../theme';
import { useRequests } from '../context/RequestsContext';

// Backend-backed entries replace static messages

function Bubble({ entry, colors }) {
  const isAdmin = entry.name?.toLowerCase() === 'admin';
  return (
    <View style={[styles.bubble, isAdmin ? { backgroundColor: '#0f2a5f' } : { backgroundColor: '#164e3f' }]}> 
      <Text style={[styles.from, { color: colors.muted }]}>{entry.name || 'Unknown'}</Text>
      <Text style={[styles.text, { color: 'white' }]}>{entry.message}</Text>
      {!!entry.location && <Text style={[styles.meta, { color: colors.muted }]}>Location: {entry.location}</Text>}
      {!!entry.contact && <Text style={[styles.meta, { color: colors.muted }]}>Contact: {entry.contact}</Text>}
    </View>
  );
}

export default function AdminChatScreen() {
  const { colors } = useTheme();
  const { entries, loading, addEntry, load } = useRequests();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');

  async function onSubmit() {
    if (!name || !message) return;
    await addEntry({ name, message, location, contact });
    setMessage('');
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <FlatList
        data={entries}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => <Bubble entry={item} colors={colors} />}
        contentContainerStyle={{ paddingVertical: spacing.md }}
      />
      <View style={[styles.inputBar, { borderTopColor: colors.border, borderTopWidth: 1 }]}> 
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Name"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
        />
      </View>
      <View style={styles.inputBar}> 
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Message"
          placeholderTextColor={colors.muted}
          value={message}
          onChangeText={setMessage}
        />
      </View>
      <View style={styles.inputBar}> 
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Location (optional)"
          placeholderTextColor={colors.muted}
          value={location}
          onChangeText={setLocation}
        />
      </View>
      <View style={styles.inputBar}> 
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Contact (optional)"
          placeholderTextColor={colors.muted}
          value={contact}
          onChangeText={setContact}
        />
      </View>
      <View style={[styles.actionsRow]}> 
        <TouchableOpacity onPress={onSubmit} style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#0b1220', fontWeight: '700' }}>Create Entry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={load} style={[styles.button, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
          <Text style={{ color: colors.text }}>{loading ? 'Loading…' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  from: {
    fontSize: 11,
    marginBottom: 2,
  },
  text: {
    fontSize: 14,
  },
  meta: {
    fontSize: 12,
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  button: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
});




