import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList } from 'react-native';
import { spacing, radius, useTheme } from '../theme';
import { useAnnouncements } from '../context/AnnouncementsContext';

export default function AdminAnnouncementsScreen() {
  const { colors } = useTheme();
  const { announcements, addAnnouncement } = useAnnouncements();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const onPost = () => {
    if (!title.trim() && !body.trim()) return;
    addAnnouncement(title.trim() || 'Announcement', body.trim());
    setTitle('');
    setBody('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>Post Announcement</Text>
      <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]} placeholder="Title" placeholderTextColor={colors.muted} value={title} onChangeText={setTitle} />
      <TextInput style={[styles.input, { minHeight: 80, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]} placeholder="Message" placeholderTextColor={colors.muted} value={body} onChangeText={setBody} multiline />
      <View style={{ marginBottom: spacing.lg }}>
        <Button title="Post to All Users" onPress={onPost} color={colors.primary} />
      </View>

      <Text style={[styles.subtitle, { color: colors.muted }]}>Recent Announcements</Text>
      <FlatList
        data={announcements}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.cardBody, { color: colors.muted }]}>{item.body}</Text>
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardBody: {
    fontSize: 13,
    marginTop: 2,
  },
});




