import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatApi } from '../../api/chat';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/MigIcon';
import { Text } from '../../components/ui/text';
import { useTheme } from '../../theme-context';
import { colors } from '../../theme';

export function MessagesScreen({ api, data, openChat, onOpenProfile, onUnreadChange, setActive }) {
  const [dialogs, setDialogs] = useState([]);
  const [query, setQuery] = useState('');
  const [groupOpen, setGroupOpen] = useState(false);
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const users = data?.users || [];
  const currentUser = data?.currentUser || {};

  const load = useCallback(async () => {
    const result = await chatApi.dialogs(api);
    const next = result.dialogs || [];
    setDialogs(next);
    onUnreadChange?.(next.reduce((sum, dialog) => sum + Number(dialog.unread || dialog.unreadCount || 0), 0));
  }, [api, onUnreadChange]);

  useEffect(() => { load(); }, [load]);

  const start = useCallback(async (user) => {
    const d = await chatApi.openDialog(api, user.id);
    await load();
    openChat(d.dialog.id, dialogUser(d.dialog, user));
  }, [api, load, openChat]);

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
        <Pressable onPress={() => setActive?.('feed')} hitSlop={12} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Назад">
          <Icon name="back" size={29} color={palette.ink} />
        </Pressable>
        <Text numberOfLines={1} style={[styles.title, { color: palette.ink }]}>{currentUser?.handle || currentUser?.name || 'Сообщения'}</Text>
        <Pressable onPress={() => setGroupOpen(true)} hitSlop={12} style={styles.composeBtn} accessibilityRole="button" accessibilityLabel="Создать группу">
          <Icon name="plus" size={27} color={palette.ink} />
        </Pressable>
      </View>

      <View style={[styles.searchBox, { backgroundColor: isDark ? '#15151E' : '#F2F2F5' }]}> 
        <Icon name="search" size={21} color={palette.muted} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Поиск" placeholderTextColor={palette.muted} style={[styles.searchInput, { color: palette.ink }]} accessibilityLabel="Поиск сообщений" />
        {query ? <Pressable onPress={() => setQuery('')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Очистить поиск"><Icon name="close" size={18} color={palette.muted} /></Pressable> : null}
      </View>

      {searchUsers.length ? (
        <View style={styles.foundUsersBlock}>
          {searchUsers.map((user) => <UserResult key={user.id} user={user} onProfile={() => onOpenProfile?.(user)} onMessage={() => start(user)} />)}
        </View>
      ) : null}
    </View>
  );

  const renderDialog = useCallback(({ item }) => (
    <DialogRow dialog={item} onPress={() => openChat(item.id, dialogUser(item))} onOpenProfile={onOpenProfile} />
  ), [openChat, onOpenProfile]);

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
      <GroupCreateModal visible={groupOpen} users={users} currentUserId={currentUser?.id} onClose={() => setGroupOpen(false)} onCreate={createGroup} />
    </View>
  );
}

function dialogUser(dialog, fallbackUser) {
  if (dialog?.isGroup) return { id: dialog.id, isGroup: true, name: dialog.title || 'Группа', handle: `${dialog.users?.length || 0} участников`, users: dialog.users || [] };
  return fallbackUser || dialog?.user || null;
}

function UserResult({ user, onProfile, onMessage }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.userResult, { borderBottomColor: palette.line }]}>
      <Pressable onPress={onProfile} style={styles.avatarTap} accessibilityRole="button" accessibilityLabel={`Открыть профиль ${user.name || 'пользователя'}`}>
        <Avatar user={user} size={54} />
      </Pressable>
      <Pressable onPress={onProfile} style={styles.dialogText} accessibilityRole="button" accessibilityLabel={`Открыть профиль ${user.name || 'пользователя'}`}>
        <Text numberOfLines={1} style={[styles.dialogName, { color: palette.ink }]}>{user.name || user.handle || 'Пользователь'}</Text>
        <Text numberOfLines={1} style={[styles.lastText, { color: palette.muted }]}>{user.handle || 'Профиль'}</Text>
      </Pressable>
      <Pressable onPress={onMessage} style={styles.messageAction} accessibilityRole="button" accessibilityLabel="Написать">
        <Icon name="send" size={36} active />
      </Pressable>
    </View>
  );
}

function DialogRow({ dialog, onPress, onOpenProfile }) {
  const { palette } = useTheme();
  const unread = Number(dialog.unread || dialog.unreadCount || 0);
  const isGroup = !!dialog.isGroup;
  const name = isGroup ? (dialog.title || 'Группа') : (dialog.user?.name || dialog.user?.handle || 'Диалог');
  const last = dialog.lastText || 'Нет сообщений';
  const time = compactTime(dialog.lastAt || dialog.updatedAt || dialog.createdAt);
  const unreadLine = unread > 0 ? `${unread} ${pluralMessages(unread)}` : last;
  const openProfile = () => !isGroup && dialog.user ? onOpenProfile?.(dialog.user) : onPress();
  return (
    <View style={[styles.dialogRow, { backgroundColor: palette.bg, borderBottomColor: palette.line }]}>
      <Pressable onPress={openProfile} style={styles.avatarTap} accessibilityRole="button" accessibilityLabel={isGroup ? 'Открыть группу' : `Открыть профиль ${name}`}>
        {isGroup ? <StackAvatars users={dialog.users || []} /> : <Avatar user={dialog.user} size={60} />}
      </Pressable>
      <Pressable onPress={onPress} style={styles.dialogText} accessibilityRole="button" accessibilityLabel={`Открыть диалог ${name}`}>
        <View style={styles.nameLine}>
          <Text numberOfLines={1} style={[styles.dialogName, { color: palette.ink }]}>{name}</Text>
          {time ? <Text numberOfLines={1} style={[styles.dialogTime, { color: palette.muted }]}>{time}</Text> : null}
        </View>
        <Text numberOfLines={1} style={[styles.lastText, { color: unread > 0 ? palette.ink : palette.muted }, unread > 0 && styles.lastTextUnread]}>{unreadLine}</Text>
      </Pressable>
      {unread > 0 ? <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{unread > 99 ? '99+' : unread}</Text></View> : null}
    </View>
  );
}

function StackAvatars({ users = [] }) {
  const first = users.slice(0, 3);
  return (
    <View style={styles.stackWrap}>
      {first.map((user, index) => (
        <View key={user.id || index} style={[styles.stackAvatar, { left: index * 16, zIndex: 4 - index }]}><Avatar user={user} size={42} /></View>
      ))}
    </View>
  );
}

function GroupCreateModal({ visible, users = [], currentUserId, onClose, onCreate }) {
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const q = query.trim().toLowerCase();
  const list = users.filter((user) => user.id !== currentUserId).filter((user) => `${user.name || ''} ${user.handle || ''}`.toLowerCase().includes(q)).slice(0, 40);
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
              const checked = selectedIds.has(user.id);
              return (
                <Pressable key={user.id} onPress={() => toggle(user)} style={[styles.groupUserRow, { borderBottomColor: palette.line }]}>
                  <Avatar user={user} size={48} />
                  <View style={styles.dialogText}>
                    <Text style={[styles.dialogName, { color: palette.ink }]}>{user.name || user.handle}</Text>
                    <Text style={[styles.lastText, { color: palette.muted }]}>{user.handle}</Text>
                  </View>
                  <View style={[styles.check, checked && styles.checkOn]}>{checked ? <Icon name="check" size={17} color={colors.white} /> : null}</View>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable onPress={create} disabled={selected.length < 2} style={[styles.createGroupBtn, selected.length < 2 && { opacity: 0.45 }]}>
            <Text style={styles.createGroupText}>Создать группу</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function EmptyDialogs({ hasQuery, onClear }) {
  return <EmptyState title={hasQuery ? 'Ничего не найдено' : 'Нет диалогов'} action={hasQuery ? 'Сбросить поиск' : undefined} onPress={hasQuery ? onClear : undefined} />;
}

function pluralMessages(n) {
  const value = Math.abs(Number(n || 0));
  const last = value % 10;
  const lastTwo = value % 100;
  if (last === 1 && lastTwo !== 11) return 'новое сообщение';
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'новых сообщения';
  return 'новых сообщений';
}

function compactTime(value) {
  if (!value) return '';
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'сейчас';
  if (min < 60) return `${min} мин.`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч.`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} д.`;
  const w = Math.floor(d / 7);
  if (w < 8) return `${w} нед.`;
  return `${Math.floor(d / 30)} мес.`;
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: { borderBottomWidth: 1, paddingBottom: 10 },
  topRow: { height: 54, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  composeBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 23, fontWeight: '900' },
  searchBox: { minHeight: 44, borderRadius: 16, marginHorizontal: 16, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '700', paddingVertical: 8 },
  foundUsersBlock: { paddingTop: 8 },
  userResult: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, borderBottomWidth: StyleSheet.hairlineWidth },
  dialogRow: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, borderBottomWidth: StyleSheet.hairlineWidth },
  avatarTap: { width: 62, alignItems: 'center' },
  dialogText: { flex: 1, minWidth: 0 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dialogName: { flex: 1, fontSize: 16, fontWeight: '900' },
  dialogTime: { fontSize: 13, fontWeight: '800' },
  lastText: { marginTop: 4, fontSize: 14, lineHeight: 18, fontWeight: '800' },
  lastTextUnread: { fontWeight: '900' },
  unreadBadge: { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: '#316BFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7 },
  unreadBadgeText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  messageAction: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  stackWrap: { width: 72, height: 52, position: 'relative' },
  stackAvatar: { position: 'absolute', top: 5, borderRadius: 22, borderWidth: 2, borderColor: colors.white, overflow: 'hidden' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,.28)' },
  groupSheet: { maxHeight: '86%', borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, padding: 16 },
  handle: { width: 42, height: 5, borderRadius: 99, alignSelf: 'center', marginBottom: 14 },
  groupHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  groupTitle: { fontSize: 24, fontWeight: '900' },
  groupClose: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  groupList: { marginTop: 10, maxHeight: 360 },
  groupUserRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.hot, borderColor: colors.hot },
  createGroupBtn: { height: 54, marginTop: 12, borderRadius: 18, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center' },
  createGroupText: { color: colors.white, fontSize: 16, fontWeight: '900' },
});
