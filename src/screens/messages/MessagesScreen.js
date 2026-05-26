import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatApi } from '../../api/chat';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/MigIcon';
import { Text } from '../../components/ui/text';
import { useTheme } from '../../theme-context';
import { colors, shadow } from '../../theme';

export function MessagesScreen({ api, data, openChat, setActive }) {
  const [dialogs, setDialogs] = useState([]);
  const [query, setQuery] = useState('');
  const [groupOpen, setGroupOpen] = useState(false);
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
    openChat(d.dialog.id, dialogUser(d.dialog, user));
  }, [api, openChat]);

  const createGroup = useCallback(async (selectedUsers) => {
    const title = selectedUsers.map((u) => u.name || u.handle).filter(Boolean).slice(0, 4).join(', ');
    const d = await chatApi.createGroup(api, selectedUsers.map((u) => u.id), title);
    setGroupOpen(false);
    await load();
    openChat(d.dialog.id, dialogUser(d.dialog));
  }, [api, load, openChat]);

  const q = query.trim().toLowerCase();
  const filteredDialogs = useMemo(() => {
    if (!q) return dialogs;
    return dialogs.filter((dialog) => `${dialog.title || ''} ${dialog.user?.name || ''} ${dialog.user?.handle || ''} ${(dialog.users || []).map((u) => `${u.name || ''} ${u.handle || ''}`).join(' ')} ${dialog.lastText || ''}`.toLowerCase().includes(q));
  }, [dialogs, q]);

  const searchUsers = useMemo(() => {
    if (!q) return [];
    const dialogUserIds = new Set(dialogs.filter((d) => !d.isGroup).map((dialog) => dialog.user?.id));
    return users
      .filter((user) => user.id !== currentUser?.id)
      .filter((user) => !dialogUserIds.has(user.id))
      .filter((user) => `${user.name || ''} ${user.handle || ''}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [dialogs, q, users, currentUser?.id]);

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: palette.bg, borderBottomColor: palette.line }]}> 
      <View style={styles.topRow}>
        <Pressable onPress={() => setActive('feed')} hitSlop={12} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Назад">
          <Icon name="back" size={29} color={palette.ink} />
        </Pressable>
        <Text numberOfLines={1} style={[styles.title, { color: palette.ink }]}>{currentUser?.handle || currentUser?.name || 'Сообщения'}</Text>
        <Pressable onPress={() => setGroupOpen(true)} hitSlop={12} style={styles.composeBtn} accessibilityRole="button" accessibilityLabel="Создать группу">
          <Icon name="plus" size={27} color={palette.ink} />
        </Pressable>
      </View>

      <View style={[styles.searchBox, { backgroundColor: isDark ? '#15151E' : '#F2F2F5' }]}> 
        <Icon name="search" size={21} color={palette.muted} />
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
          {searchUsers.map((user) => <UserResult key={user.id} user={user} onPress={() => start(user)} />)}
        </View>
      ) : null}
    </View>
  );

  const renderDialog = useCallback(({ item }) => (
    <DialogRow dialog={item} onPress={() => openChat(item.id, dialogUser(item))} />
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
        initialNumToRender={16}
        maxToRenderPerBatch={12}
        windowSize={8}
      />
      <GroupCreateModal visible={groupOpen} users={users} onClose={() => setGroupOpen(false)} onCreate={createGroup} />
    </View>
  );
}

function dialogUser(dialog, fallbackUser) {
  if (dialog?.isGroup) return { id: dialog.id, isGroup: true, name: dialog.title || 'Группа', handle: `${dialog.users?.length || 0} участников`, users: dialog.users || [] };
  return fallbackUser || dialog?.user || null;
}

function UserResult({ user, onPress }) {
  const { palette } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.dialogRow, { backgroundColor: pressed ? palette.faint : palette.bg, borderBottomColor: palette.line }]} accessibilityRole="button" accessibilityLabel={`Написать ${user.name || 'пользователю'}`}>
      <Avatar user={user} size={58} />
      <View style={styles.dialogText}>
        <Text numberOfLines={1} style={[styles.dialogName, { color: palette.ink }]}>{user.name || user.handle || 'Пользователь'}</Text>
        <Text numberOfLines={1} style={[styles.lastText, { color: palette.muted }]}>{user.handle || 'Начать диалог'}</Text>
      </View>
      <Icon name="send" size={31} active />
    </Pressable>
  );
}

function DialogRow({ dialog, onPress }) {
  const { palette, isDark } = useTheme();
  const unread = Number(dialog.unread || dialog.unreadCount || 0);
  const isUnread = unread > 0;
  const isGroup = !!dialog.isGroup;
  const name = isGroup ? (dialog.title || 'Группа') : (dialog.user?.name || dialog.user?.handle || 'Диалог');
  const last = dialog.lastText || 'Нет сообщений';
  const time = dialog.timeLabel || '';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.dialogRow, { backgroundColor: pressed ? palette.faint : palette.bg, borderBottomColor: palette.line }]} accessibilityRole="button" accessibilityLabel={`Открыть диалог ${name}`}>
      {isGroup ? <StackAvatars users={dialog.users || []} /> : <Avatar user={dialog.user} size={60} />}
      <View style={styles.dialogText}>
        <View style={styles.nameLine}>
          <Text numberOfLines={1} style={[styles.dialogName, { color: palette.ink }]}>{name}</Text>
          {time ? <Text numberOfLines={1} style={[styles.dialogTime, { color: palette.muted }]}>{time}</Text> : null}
        </View>
        <Text numberOfLines={1} style={[styles.lastText, { color: isUnread ? palette.ink : palette.muted }, isUnread && styles.lastTextUnread]}>
          {isUnread ? `${unread} ${pluralMessages(unread)}` : last}
        </Text>
      </View>
      {isUnread ? <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{unread > 99 ? '99+' : unread}</Text></View> : <View style={[styles.dot, { backgroundColor: isDark ? 'rgba(255,255,255,.16)' : 'rgba(57,106,255,.18)' }]} />}
    </Pressable>
  );
}

function StackAvatars({ users = [] }) {
  const first = users.slice(0, 3);
  return (
    <View style={styles.stackWrap}>
      {first.map((user, index) => (
        <View key={user.id || index} style={[styles.stackAvatar, { left: index * 16, zIndex: 4 - index }]}>
          <Avatar user={user} size={42} />
        </View>
      ))}
    </View>
  );
}

function GroupCreateModal({ visible, users = [], onClose, onCreate }) {
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const q = query.trim().toLowerCase();
  const list = users.filter((user) => `${user.name || ''} ${user.handle || ''}`.toLowerCase().includes(q)).slice(0, 40);
  const selectedIds = new Set(selected.map((u) => u.id));
  const toggle = (user) => setSelected((current) => current.some((x) => x.id === user.id) ? current.filter((x) => x.id !== user.id) : [...current, user]);
  const close = () => { setQuery(''); setSelected([]); onClose?.(); };
  const create = async () => { if (selected.length < 2) return; await onCreate(selected); setQuery(''); setSelected([]); };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={[styles.groupSheet, { paddingBottom: insets.bottom + 14, backgroundColor: palette.bg, borderColor: palette.line }]}> 
          <View style={[styles.handle, { backgroundColor: palette.line }]} />
          <View style={styles.groupHead}>
            <Text style={[styles.groupTitle, { color: palette.ink }]}>Новая группа</Text>
            <Pressable onPress={close} style={[styles.groupClose, { backgroundColor: palette.surface }]}><Icon name="close" size={20} color={palette.ink} /></Pressable>
          </View>
          <View style={[styles.searchBox, { backgroundColor: isDark ? '#15151E' : '#F2F2F5', marginHorizontal: 0 }]}> 
            <Icon name="search" size={21} color={palette.muted} />
            <TextInput value={query} onChangeText={setQuery} placeholder="Пользователь" placeholderTextColor={palette.muted} style={[styles.searchInput, { color: palette.ink }]} />
          </View>
          <ScrollView style={styles.groupList} keyboardShouldPersistTaps="handled">
            {list.map((user) => {
              const active = selectedIds.has(user.id);
              return <Pressable key={user.id} onPress={() => toggle(user)} style={[styles.groupUserRow, { borderBottomColor: palette.line }]}>
                <Avatar user={user} size={52} />
                <View style={styles.dialogText}>
                  <Text numberOfLines={1} style={[styles.dialogName, { color: palette.ink }]}>{user.name || user.handle || 'Пользователь'}</Text>
                  <Text numberOfLines={1} style={[styles.lastText, { color: palette.muted }]}>{user.handle || '@user'}</Text>
                </View>
                <View style={[styles.check, active && styles.checkActive]}>{active ? <Icon name="check" size={16} color={colors.white} /> : null}</View>
              </Pressable>;
            })}
          </ScrollView>
          <Pressable onPress={create} disabled={selected.length < 2} style={[styles.createGroupBtn, selected.length < 2 && { opacity: 0.5 }]}>
            <Text style={styles.createGroupText}>Создать группу</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function pluralMessages(count) {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return 'новых сообщений';
  if (n1 > 1 && n1 < 5) return 'новых сообщения';
  if (n1 === 1) return 'новое сообщение';
  return 'новых сообщений';
}

function EmptyDialogs({ hasQuery, onClear }) {
  if (hasQuery) return <EmptyState title="Ничего не найдено" action="Очистить поиск" onPress={onClear} />;
  return <EmptyState title="Пока нет диалогов" />;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 18, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  backBtn: { width: 34, height: 42, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  composeBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  searchBox: { minHeight: 42, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, minHeight: 42, fontSize: 15, fontWeight: '800' },
  foundUsersBlock: { paddingTop: 10 },
  dialogRow: { minHeight: 82, paddingHorizontal: 18, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  dialogText: { flex: 1, minWidth: 0 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dialogName: { flex: 1, fontSize: 16, fontWeight: '900' },
  lastText: { marginTop: 4, fontSize: 14, fontWeight: '800' },
  lastTextUnread: { fontWeight: '900' },
  dialogTime: { flexShrink: 0, fontSize: 12, fontWeight: '800' },
  unreadBadge: { minWidth: 25, height: 25, borderRadius: 13, paddingHorizontal: 7, backgroundColor: '#396AFF', alignItems: 'center', justifyContent: 'center' },
  unreadBadgeText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  stackWrap: { width: 70, height: 50, position: 'relative' },
  stackAvatar: { position: 'absolute', top: 4, borderRadius: 22, borderWidth: 2, borderColor: colors.white, overflow: 'hidden' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(6,6,12,.28)' },
  groupSheet: { maxHeight: '86%', borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, paddingHorizontal: 18, paddingTop: 10, ...shadow },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, marginBottom: 16 },
  groupHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  groupTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.4 },
  groupClose: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  groupList: { maxHeight: 420, marginTop: 8 },
  groupUserRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#D7D3E4', alignItems: 'center', justifyContent: 'center' },
  checkActive: { backgroundColor: '#F22D8F', borderColor: '#F22D8F' },
  createGroupBtn: { minHeight: 56, borderRadius: 28, backgroundColor: '#F22D8F', alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  createGroupText: { color: colors.white, fontSize: 17, fontWeight: '900' },
});
