import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatApi } from '../../api/chat';
import { Avatar } from '../../components/ui/Avatar';
import { BrandActionIcon } from '../../components/ui/BrandActionIcon';
import { EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/MigIcon';
import { Text } from '../../components/ui/text';
import { useTheme } from '../../theme-context';
import { colors } from '../../theme';

export function MessagesScreen({ api, data, openChat, setActive }) {
  const [dialogs, setDialogs] = useState([]);
  const { palette } = useTheme();
  const [query, setQuery] = useState('');
  const users = data?.users || [];
  const insets = useSafeAreaInsets();
  const load = useCallback(async () => setDialogs((await chatApi.dialogs(api)).dialogs || []), [api]);

  useEffect(() => { load(); }, [load]);

  const start = useCallback(async (user) => {
    const d = await chatApi.openDialog(api, user.id);
    openChat(d.dialog.id, user);
  }, [api, openChat]);

  const filteredDialogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dialogs;
    return dialogs.filter((dialog) => {
      const name = `${dialog.user?.name || ''} ${dialog.user?.handle || ''} ${dialog.lastText || ''}`.toLowerCase();
      return name.includes(q);
    });
  }, [dialogs, query]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = users.filter((user) => !dialogs.some((dialog) => dialog.user?.id === user.id));
    if (!q) return list;
    return list.filter((user) => `${user.name || ''} ${user.handle || ''}`.toLowerCase().includes(q));
  }, [dialogs, query, users]);

  const header = (
    <MessagesHeader palette={palette}
      insets={insets}
      query={query}
      onQuery={setQuery}
      users={filteredUsers}
      onBack={() => setActive('feed')}
      onStart={start}
    />
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
        ListEmptyComponent={<EmptyDialogs hasQuery={!!query.trim()} onClear={() => setQuery('')} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 112 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={8}
        removeClippedSubviews
      />
    </View>
  );
}

function MessagesHeader({ palette, insets, query, onQuery, users, onBack, onStart }) {
  return (
    <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: palette.bg }]}> 
      <View style={styles.topRow}>
        <Pressable onPress={onBack} style={[styles.iconBtn, { backgroundColor: palette.surface, borderColor: palette.line }]} accessibilityRole="button" accessibilityLabel="Назад">
          <Icon name="back" size={24} color={palette.ink} />
        </Pressable>
        <View style={styles.titleBox}>
          <Text style={styles.title}>Сообщения</Text>
          <Text style={styles.subtitle}>Чаты и быстрые ответы</Text>
        </View>
        <View style={styles.sendIconWrap}>
          <BrandActionIcon name="share" size={42} />
        </View>
      </View>

      <View style={[styles.searchBox, { backgroundColor: palette.faint }]}>
        <Icon name="comment" size={19} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={onQuery}
          placeholder="Поиск"
          placeholderTextColor={palette.muted}
          style={[styles.searchInput, { color: palette.ink }]}
          accessibilityLabel="Поиск сообщений"
        />
        {query ? (
          <Pressable onPress={() => onQuery('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Очистить поиск">
            <Icon name="close" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {users.length ? (
        <View style={styles.peopleBlock}>
          <View style={styles.sectionLine}>
            <Text style={styles.sectionTitle}>Новые</Text>
            <Text style={styles.sectionHint}>написать</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peopleRow}>
            {users.slice(0, 12).map((user) => <StoryUser key={user.id} user={user} onPress={() => onStart(user)} />)}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.sectionLine}>
        <Text style={styles.sectionTitle}>Сообщения</Text>
        <Text style={styles.sectionHint}>активные диалоги</Text>
      </View>
    </View>
  );
}

function StoryUser({ user, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.storyUser} accessibilityRole="button" accessibilityLabel={`Написать ${user.name || 'пользователю'}`}>
      <View style={styles.storyRing}>
        <Avatar user={user} size={64} />
      </View>
      <Text numberOfLines={1} style={styles.storyName}>{user.name || user.handle || 'Близз'}</Text>
    </Pressable>
  );
}

function DialogRow({ dialog, onPress }) {
  const { palette } = useTheme();
  const unread = dialog.unread || dialog.unreadCount || 0;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.dialogRow, { backgroundColor: palette.bg }, pressed && { backgroundColor: palette.faint }]} accessibilityRole="button" accessibilityLabel={`Открыть диалог ${dialog.user?.name || ''}`}>
      <Avatar user={dialog.user} size={58} ringColor={unread ? colors.hot : undefined} />
      <View style={styles.dialogText}>
        <View style={styles.dialogTop}>
          <Text numberOfLines={1} style={styles.dialogName}>{dialog.user?.name || dialog.user?.handle || 'Диалог'}</Text>
          <Text style={styles.dialogTime}>{dialog.timeLabel || 'сейчас'}</Text>
        </View>
        <Text numberOfLines={1} style={[styles.lastText, unread && styles.lastTextUnread]}>{dialog.lastText || 'Начните диалог'}</Text>
      </View>
      {unread ? <View style={styles.unreadDot} /> : <BrandActionIcon name="comment" size={34} />}
    </Pressable>
  );
}

function EmptyDialogs({ hasQuery, onClear }) {
  if (hasQuery) {
    return <EmptyState title="Ничего не найдено" text="Попробуйте другое имя или handle." action="Сбросить поиск" onPress={onClear} />;
  }
  return <EmptyState title="Пока нет диалогов" text="Выберите пользователя в верхнем списке, чтобы начать чат." />;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingBottom: 8, backgroundColor: colors.bg },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  titleBox: { flex: 1, minWidth: 0 },
  title: { color: colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: colors.muted, fontSize: 13, fontWeight: '700', marginTop: 2 },
  sendIconWrap: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  searchBox: { minHeight: 46, borderRadius: 18, backgroundColor: '#F1EFF8', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 18 },
  searchInput: { flex: 1, minHeight: 44, color: colors.ink, fontSize: 16, fontWeight: '700' },
  peopleBlock: { marginBottom: 8 },
  sectionLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2, marginBottom: 10 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  sectionHint: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  peopleRow: { gap: 14, paddingBottom: 14 },
  storyUser: { width: 76, alignItems: 'center' },
  storyRing: { width: 70, height: 70, borderRadius: 35, padding: 3, borderWidth: 2, borderColor: colors.hot, backgroundColor: colors.white },
  storyName: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 7, maxWidth: 74 },
  dialogRow: { minHeight: 76, paddingHorizontal: 16, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bg },
  pressed: { backgroundColor: '#F5F2FB' },
  dialogText: { flex: 1, minWidth: 0 },
  dialogTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dialogName: { color: colors.ink, fontSize: 16, fontWeight: '900', flex: 1 },
  dialogTime: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  lastText: { color: colors.muted, fontSize: 14, fontWeight: '700', marginTop: 4 },
  lastTextUnread: { color: colors.ink, fontWeight: '900' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.hot, marginRight: 10 },
});
