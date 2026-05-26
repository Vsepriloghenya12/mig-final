import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatApi } from '../api/chat';
import { colors, shadow } from '../theme';
import { useTheme } from '../theme-context';
import { Avatar } from './ui/Avatar';
import { Icon } from './ui/MigIcon';
import { Text } from './ui/text';

export function UserSearchSheet({ visible, users = [], currentUserId, api, onClose, onOpenProfile, onOpenChat }) {
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const q = query.trim().replace(/^@+/, '').toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return users
      .filter((u) => u?.id && u.id !== currentUserId)
      .filter((u) => `${u.name || ''} ${u.handle || ''}`.toLowerCase().replace(/^@+/, '').includes(q))
      .slice(0, 20);
  }, [q, users, currentUserId]);

  const openProfile = (user) => {
    onClose?.();
    onOpenProfile?.(user);
  };

  const message = async (user) => {
    const result = await chatApi.openDialog(api, user.id);
    onClose?.();
    onOpenChat?.(result.dialog.id, user);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Закрыть поиск" />
        <View style={[styles.sheet, { paddingTop: 10, paddingBottom: insets.bottom + 14, backgroundColor: palette.bg, borderColor: palette.line }]}> 
          <View style={[styles.handle, { backgroundColor: palette.line }]} />
          <View style={styles.headRow}>
            <Text style={[styles.title, { color: palette.ink }]}>Поиск</Text>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: palette.surface }]} accessibilityRole="button" accessibilityLabel="Закрыть">
              <Icon name="close" size={20} color={palette.ink} />
            </Pressable>
          </View>
          <View style={[styles.searchBox, { backgroundColor: isDark ? '#15151E' : '#F2F2F5' }]}> 
            <Icon name="search" size={22} color={palette.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Никнейм"
              placeholderTextColor={palette.muted}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.searchInput, { color: palette.ink }]}
              accessibilityLabel="Поиск по никнейму"
            />
            {query ? <Pressable onPress={() => setQuery('')} hitSlop={12}><Icon name="close" size={18} color={palette.muted} /></Pressable> : null}
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.results}>
            {!q ? <Text style={[styles.empty, { color: palette.muted }]}>Введите никнейм пользователя</Text> : null}
            {q && !results.length ? <Text style={[styles.empty, { color: palette.muted }]}>Ничего не найдено</Text> : null}
            {results.map((user) => (
              <View key={user.id} style={[styles.row, { borderBottomColor: palette.line }]}> 
                <Pressable onPress={() => openProfile(user)} style={styles.userTap} accessibilityRole="button" accessibilityLabel={`Открыть профиль ${user.name || user.handle || ''}`}> 
                  <Avatar user={user} size={54} />
                  <View style={styles.userText}>
                    <Text numberOfLines={1} style={[styles.name, { color: palette.ink }]}>{user.name || user.handle || 'Пользователь'}</Text>
                    <Text numberOfLines={1} style={[styles.handleText, { color: palette.muted }]}>{user.handle || '@user'}</Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => message(user)} style={styles.messageBtn} accessibilityRole="button" accessibilityLabel={`Написать ${user.name || user.handle || ''}`}> 
                  <Icon name="send" size={33} active />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(6,6,12,.28)' },
  sheet: { maxHeight: '84%', borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, paddingHorizontal: 18, ...shadow },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, marginBottom: 16 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.4 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  searchBox: { minHeight: 50, borderRadius: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  searchInput: { flex: 1, minHeight: 48, fontSize: 17, fontWeight: '800' },
  results: { paddingTop: 4, paddingBottom: 12 },
  row: { minHeight: 78, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  userTap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 10 },
  userText: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: '900' },
  handleText: { marginTop: 3, fontSize: 14, fontWeight: '800' },
  messageBtn: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  empty: { paddingVertical: 30, textAlign: 'center', fontSize: 15, fontWeight: '800' },
});
