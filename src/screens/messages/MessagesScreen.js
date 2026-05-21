import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { chatApi } from '../../api/chat';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { colors, topInset } from '../../theme';

export function MessagesScreen({ api, data, openChat, setActive }) {
  const [dialogs, setDialogs] = useState([]);
  const [users, setUsers] = useState(data?.users || []);
  const load = async () => setDialogs((await chatApi.dialogs(api)).dialogs || []);
  useEffect(() => { load(); }, []);
  const start = async (user) => { const d = await chatApi.openDialog(api, user.id); openChat(d.dialog.id, user); };
  return <View style={styles.wrap}><View style={styles.head}><Pressable onPress={() => setActive('feed')}><Icon name="back" size={34} /></Pressable><Text style={styles.title}>Сообщения</Text></View>
    <ScrollView contentContainerStyle={styles.content}>
      {dialogs.length ? dialogs.map((d) => <Pressable key={d.id} onPress={() => openChat(d.id, d.user)} style={styles.row}><Avatar user={d.user} size={54} /><View style={{ flex: 1 }}><Text style={styles.name}>{d.user?.name}</Text><Text numberOfLines={1} style={styles.last}>{d.lastText || 'Начните диалог'}</Text></View></Pressable>) : <EmptyState title="Пока нет диалогов" text="Напишите пользователю из списка ниже." />}
      <Text style={styles.section}>Пользователи</Text>
      {users.map((u) => <Pressable key={u.id} onPress={() => start(u)} style={styles.row}><Avatar user={u} size={46} /><View style={{ flex: 1 }}><Text style={styles.name}>{u.name}</Text><Text style={styles.last}>{u.handle}</Text></View><Text style={styles.write}>Написать</Text></Pressable>)}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  head: { paddingTop: topInset + 8, paddingHorizontal: 16, height: topInset + 64, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: colors.ink, fontSize: 25, fontWeight: '900' },
  content: { paddingBottom: 110 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 18, paddingVertical: 13, borderBottomWidth: 1, borderColor: colors.line },
  name: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  last: { color: colors.muted, marginTop: 3, fontWeight: '700' },
  section: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 8, color: colors.hot, fontWeight: '900' },
  write: { color: colors.hot, fontWeight: '900' }
});
