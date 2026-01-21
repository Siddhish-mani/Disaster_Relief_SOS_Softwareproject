import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useTheme, spacing, radius } from '../theme';

export default function UserChatScreen() {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', from: 'Admin', text: 'How can we help?' },
    { id: '2', from: 'You', text: 'Need water and medical help.' },
  ]);

  const send = () => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: String(Date.now()), from: 'You', text: text.trim() }]);
    setText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <FlatList
        data={messages}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.from === 'You' ? { backgroundColor: '#164e3f', alignSelf: 'flex-end' } : { backgroundColor: '#0f2a5f', alignSelf: 'flex-start' }]}> 
            <Text style={{ color: '#9CA3AF', fontSize: 11 }}>{item.from}</Text>
            <Text style={{ color: 'white', marginTop: 2 }}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingVertical: spacing.md }}
      />
      <View style={[styles.inputBar, { borderTopColor: colors.border, borderTopWidth: 1 }]}> 
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          value={text}
          onChangeText={setText}
          placeholder="Type a message"
          placeholderTextColor={colors.muted}
        />
        <TouchableOpacity onPress={send} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#0b1220', fontWeight: '800' }}>Send</Text>
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
  sendBtn: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
});






















