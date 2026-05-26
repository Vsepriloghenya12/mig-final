import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatApi } from '../../api/chat';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/MigIcon';
import { Text } from '../../components/ui/text';
import { useTheme } from '../../theme-context';
import { colors } from '../../theme';

export function MessagesScreen({ api, data, openChat, setActive }) {
  const [dialogs, setDialogs] = useState([]);
  const [query, setQuery] = useState('');
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const users = data?.users || [];
  const currentUser = data?.currentUser || {};

  const load = useCallback(async () => {
    const result = await chatApi.dialogs(api);
    setDialogs(result.dialogs || []);
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const start = useCallback(async (user) => {
    const d = await chatApi.openDialog(api, user.id);
    openChat(d.dialog.id, user);
  }, [api, openChat]);

  const q = query.trim().toLowerCase();
  const filteredDialogs = useMemo(() => {
    if (!q) return dialogs;
    return dialogs.filter((dialog) => `${dialog.user?.name || ''} ${dialog.user?.handle || ''} ${dialog.lastText || ''}`.toLowerCase().includes(q));
  }, [dialogs, q]);

  const searchUsers = useMemo(() => {
    if (!q) return [];
    const dialogUserIds = new Set(dialogs.map((dialog) => dialog.user?.id));
    return users
      .filter((user) => user.id !== currentUser?.id)
      .filter((user) => !dialogUserIds.has(user.id))
      .filter((user) => `${user.name || ''} ${user.handle || ''}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [dialogs, q, users, currentUser?.id]);

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: palette.bg }]}> 
      <View style={styles.topRow}>
        <Pressable onPress={() => setActive('feed')} hitSlop={12} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Назад">
          <Icon name="back" size={28} color={palette.ink} />
        </Pressable>
        <View style={styles.accountBox}>
          <Text numberOfLines={1} style={[styles.accountName, { color: palette.ink }]}>{currentUser?.handle || currentUser?.name || 'Сообщения'}</Text>
          <Icon name="more" size={18} color={palette.ink} />
        </View>
        <Pressable onPress={() => setQuery('')} hitSlop={12} style={styles.composeBtn} accessibilityRole="button" accessibilityLabel="Новое сообщение">
          <Icon name="image" size={31} color={palette.ink} />
        </Pressable>
      </View>

      <View style={[styles.searchBox, { backgroundColor: isDark ? '#15151E' : '#F1F1F3' }]}> 
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск"
          placeholderTextColor={palette.muted}
          style={[styles.searchInput, { color: palette.ink }]}
          accessibilityLabel="Поиск сообщений"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Очистить поиск">
            <Icon name="close" size={18} color={palette.muted} />
          </Pressable>
        ) : null}
      </View>

      {searchUsers.length ? (
        <View style={styles.foundUsersBlock}>
          {searchUsers.map((user) => (
            <UserResult key={user.id} user={user} onPress={() => start(user)} />
          ))}
        </View>
      ) : null}
    </View>
  );

  const renderDialog = useCallback(({ item }) => (
    <DialogRow dialog={item} onPress={() => openChat(item.id, item.user)} />
  ), [openChat]);

  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }]}> 
      <FlatList
        data={filteredDialogs}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderDialog}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyDialogs hasQuery={!!q} onClear={() => setQuery('')} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={14}
        maxToRenderPerBatch={12}
        windowSize={8}
      />
    </View>
  );
}

function UserResult({ user, onPress }) {
  const { palette } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.userResult, { backgroundColor: pressed ? palette.faint : 'transparent' }]} accessibilityRole="button" accessibilityLabel={`Написать ${user.name || 'пользователю'}`}>
      <Avatar user={user} size={54} />
      <View style={styles.dialogText}>
        <Text numberOfLines={1} style={[styles.dialogName, { color: palette.ink }]}>{user.name || user.handle || 'Пользователь'}</Text>
        <Text numberOfLines={1} style={[styles.lastText, { color: palette.muted }]}>{user.handle || 'Открыть диалог'}</Text>
      </View>
    </Pressable>
  );
}

function formatTime(dialog) {
  return dialog.timeLabel || dialog.updatedLabel || dialog.lastTimeLabel || '';
}

function DialogRow({ dialog, onPress }) {
  const { palette } = useTheme();
  const unread = dialog.unread || dialog.unreadCount || 0;
  const isUnread = unread > 0;
  const name = dialog.user?.name || dialog.user?.handle || 'Диалог';
  const last = dialog.lastText || 'Нет сообщений';
  const time = formatTime(dialog);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.dialogRow, { backgroundColor: pressed ? palette.faint : palette.bg }]} accessibilityRole="button" accessibilityLabel={`Открыть диалог ${name}`}>
      <Avatar user={dialog.user} size={62} />
      <View style={styles.dialogText}>
        <Text numberOfLines={1} style={[styles.dialogName, { color: palette.ink }]}>{name}</Text>
        <View style={styles.previewRow}>
          <Text numberOfLines={1} style={[styles.lastText, { color: isUnread ? palette.ink : palette.muted }, isUnread && styles.lastTextUnread]}>{isUnread ? `${unread}+ новых сообщений` : last}</Text>
          {time ? <Text numberOfLines={1} style={[styles.dialogTime, { color: palette.muted }]}> · {time}</Text> : null}
        </View>
      </View>
      {isUnread ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );
}

function EmptyDialogs({ hasQuery, onClear }) {
  if (hasQuery) return <EmptyState title="Ничего не найдено" action="Очистить поиск" onPress={onClear} />;
  return <EmptyState title="Пока нет диалогов" />;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 18, paddingBottom: 8 },
  topRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  backBtn: { width: 34, height: 40, alignItems: 'center', justifyContent: 'center' },
  accountBox: { flex: 1, minWidth: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  accountName: { fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  composeBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  searchBox: { minHeight: 42, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  searchInput: { flex: 1, minHeight: 42, fontSize: 15, fontWeight: '800' },
  foundUsersBlock: { paddingTop: 4, paddingBottom: 8 },
  userResult: { minHeight: 72, borderRadius: 18, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 13 },
  dialogRow: { minHeight: 96, paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 14 },
  dialogText: { flex: 1, minWidth: 0 },
  dialogName: { fontSize: 17, fontWeight: '900', marginBottom: 4 },
  previewRow: { flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  lastText: { flexShrink: 1, fontSize: 15, fontWeight: '800' },
  lastTextUnread: { fontWeight: '900' },
  dialogTime: { fontSize: 15, fontWeight: '800' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#396AFF', marginRight: 4 },
});
