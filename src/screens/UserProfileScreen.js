import React, { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { chatApi } from '../api/chat';
import { profileActions } from '../api/actions';
import { ActionSheet, ActionSheetItem } from '../components/ui/action-sheet';
import { Avatar } from '../components/ui/Avatar';
import { BrandActionIcon } from '../components/ui/BrandActionIcon';
import { Icon } from '../components/ui/MigIcon';
import { Text } from '../components/ui/text';
import { useTheme } from '../theme-context';
import { colors } from '../theme';
import { mediaSource } from '../utils/media';
import { blockUser, reportContent } from '../utils/moderation';

export function UserProfileScreen({ user, data, api, reload, onBack, openChat, onOpenProfile }) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const [menu, setMenu] = useState(false);
  const [connections, setConnections] = useState({ visible: false, title: '', users: [] });
  const posts = (data?.posts || []).filter((p) => p.author?.id === user?.id);
  const viewUser = useMemo(() => {
    const fresh = (data?.users || []).find((u) => u.id === user?.id);
    return fresh || user || {};
  }, [data?.users, user]);

  const follow = async () => {
    try { await profileActions.follow(api, viewUser.id); await reload(); }
    catch (e) { Alert.alert('Ошибка', e.message); }
  };
  const message = async () => {
    const d = await chatApi.openDialog(api, viewUser.id);
    openChat(d.dialog.id, viewUser);
  };
  const report = () => { setMenu(false); reportContent(api, { targetType: 'profile', targetId: viewUser.id, targetUserId: viewUser.id }); };
  const block = () => { setMenu(false); blockUser(api, viewUser.id, async () => { await reload(); onBack?.(); }); };
  const openConnections = async (type) => {
    try {
      const result = await api.get(`/api/users/${viewUser.id}/connections?type=${type}`);
      setConnections({ visible: true, title: type === 'followers' ? 'Подписчики' : 'Подписки', users: result.users || [] });
    } catch (e) { Alert.alert('Ошибка', e.message); }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }]}> 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 120 }}>
        <View style={styles.head}>
          <Pressable onPress={onBack} style={[styles.headBtn, { backgroundColor: palette.surface, borderColor: palette.line }]} accessibilityRole="button" accessibilityLabel="Назад">
            <Icon name="back" size={25} color={palette.ink} />
          </Pressable>
          <Text numberOfLines={1} style={[styles.headTitle, { color: palette.ink }]}>{viewUser?.handle || viewUser?.name || 'Профиль'}</Text>
          <Pressable onPress={() => setMenu(true)} style={[styles.headBtn, { backgroundColor: palette.surface, borderColor: palette.line }]} accessibilityRole="button" accessibilityLabel="Действия с профилем"><Icon name="more" size={20} color={palette.ink} /></Pressable>
        </View>

        <View style={styles.profileTop}>
          <Avatar user={viewUser} size={96} ringColor={colors.hot} />
          <View style={styles.statsRow}>
            <Stat value={viewUser?.followers || 0} label="Подписчики" onPress={() => openConnections('followers')} />
            <Stat value={viewUser?.following || 0} label="Подписки" onPress={() => openConnections('following')} />
          </View>
        </View>

        <View style={styles.bioBlock}>
          <Text numberOfLines={1} style={[styles.name, { color: palette.ink }]}>{viewUser?.name || 'Пользователь'}</Text>
          <Text numberOfLines={1} style={styles.handle}>{viewUser?.handle || '@user'}</Text>
          {viewUser?.bio ? <Text style={[styles.bio, { color: palette.text }]}>{viewUser.bio}</Text> : null}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={follow} style={[styles.followIcon, viewUser?.isFollowing && styles.followIconActive]} accessibilityRole="button" accessibilityLabel={viewUser?.isFollowing ? 'Вы подписаны' : 'Подписаться'}>
            <Icon name="check" size={25} color={viewUser?.isFollowing ? colors.white : colors.hot} />
          </Pressable>
          <Pressable onPress={message} style={[styles.messageBtn, { borderColor: palette.line, backgroundColor: palette.surface }]} accessibilityRole="button" accessibilityLabel="Написать">
            <Text style={[styles.messageText, { color: palette.ink }]}>Сообщение</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          <View style={styles.tabActive}><BrandActionIcon name="save" size={35} /></View>
          <View style={styles.tab}><BrandActionIcon name="like" size={35} /></View>
        </View>

        <View style={styles.grid}>
          {posts.length ? posts.map((post) => {
            const source = mediaSource(post);
            return source ? <Image key={post.id} source={source} style={styles.tile} /> : <View key={post.id} style={[styles.tile, styles.tileEmpty]} />;
          }) : (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyTitle, { color: palette.ink }]}>Пока нет публикаций</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ActionSheet visible={menu} title={viewUser?.name || 'Профиль'} description="Действия с этим пользователем" onClose={() => setMenu(false)}>
        <ActionSheetItem label="Пожаловаться" description="Отправить профиль на проверку" onPress={report} />
        <ActionSheetItem label="Заблокировать" description="Скрыть пользователя из приложения" tone="destructive" onPress={block} />
      </ActionSheet>
      <ConnectionsModal visible={connections.visible} title={connections.title} users={connections.users} onClose={() => setConnections({ visible: false, title: '', users: [] })} onOpenProfile={onOpenProfile || (() => {})} />
    </View>
  );
}

function Stat({ value, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.statItem} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={styles.statValue}>{value}</Text>
      <Text numberOfLines={1} style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

function ConnectionsModal({ visible, title, users, onClose, onOpenProfile }) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.modalSheet, { backgroundColor: palette.bg, borderColor: palette.line, paddingBottom: insets.bottom + 14 }]}> 
          <View style={[styles.modalHandle, { backgroundColor: palette.line }]} />
          <View style={styles.modalHead}>
            <Text style={[styles.modalTitle, { color: palette.ink }]}>{title}</Text>
            <Pressable onPress={onClose} style={[styles.modalClose, { backgroundColor: palette.surface }]}><Icon name="close" size={22} color={palette.ink} /></Pressable>
          </View>
          <ScrollView>
            {users.length ? users.map((u) => (
              <Pressable key={u.id} onPress={() => { onClose(); onOpenProfile(u); }} style={[styles.userRow, { borderBottomColor: palette.line }]}>
                <Avatar user={u} size={52} />
                <View style={styles.userText}>
                  <Text style={[styles.userName, { color: palette.ink }]}>{u.name || u.handle}</Text>
                  <Text style={[styles.userHandle, { color: palette.muted }]}>{u.handle}</Text>
                </View>
              </Pressable>
            )) : <Text style={[styles.emptyConnections, { color: palette.muted }]}>Список пуст</Text>}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  head: { minHeight: 56, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headBtnPlaceholder: { width: 42, height: 42 },
  headTitle: { flex: 1, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  profileTop: { paddingHorizontal: 18, paddingTop: 14, flexDirection: 'row', alignItems: 'center', gap: 22 },
  statsRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  statLabel: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 3, maxWidth: 100 },
  bioBlock: { paddingHorizontal: 18, paddingTop: 14 },
  name: { fontSize: 16, fontWeight: '900' },
  handle: { color: colors.hot, fontSize: 13, fontWeight: '900', marginTop: 3 },
  bio: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, marginTop: 16 },
  followIcon: { width: 54, height: 44, borderRadius: 16, borderWidth: 1.5, borderColor: colors.hot, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  followIconActive: { backgroundColor: colors.hot, borderColor: colors.hot },
  messageBtn: { flex: 1, height: 44, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  messageText: { fontSize: 15, fontWeight: '900' },
  tabs: { marginTop: 18, flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, backgroundColor: colors.bg },
  tabActive: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: colors.ink },
  tab: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', opacity: 0.46 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 2, gap: 2, paddingTop: 2 },
  tile: { width: '32.9%', aspectRatio: 1, backgroundColor: colors.faint },
  tileEmpty: { borderWidth: 1, borderColor: colors.line },
  emptyBox: { width: '100%', minHeight: 120, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '900', textAlign: 'center' },
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,.28)' },
  modalSheet: { maxHeight: '75%', borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, padding: 16 },
  modalHandle: { width: 42, height: 5, borderRadius: 99, alignSelf: 'center', marginBottom: 14 },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  modalTitle: { fontSize: 24, fontWeight: '900' },
  modalClose: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  userRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  userText: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '900' },
  userHandle: { marginTop: 3, fontSize: 13, fontWeight: '800' },
  emptyConnections: { paddingVertical: 24, textAlign: 'center', fontWeight: '800' },
});
