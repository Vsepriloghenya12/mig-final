import React, { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, View, Text as RNText } from 'react-native';
import { profileActions } from '../api/actions';
import { API_URL } from '../config';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Icon, MailIcon } from '../components/ui/MigIcon';
import { Text } from '../components/ui/text';
import { TextField } from '../components/ui/TextField';
import { useTheme } from '../theme-context';
import { colors } from '../theme';
import { mediaSource } from '../utils/media';
import { pickAvatarAndUpload } from '../utils/picker';

export function ProfileScreen({ data, api, reload, setActive, onLogout }) {
  const user = data?.currentUser || {};
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState(false);
  const [menu, setMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState('posts');
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarPreview, setAvatarPreview] = useState('');
  const viewUser = useMemo(() => ({ ...user, avatarUrl: avatarPreview || user.avatarUrl }), [user, avatarPreview]);
  const mine = (data?.posts || []).filter((p) => p.author?.id === user.id);
  const saved = (data?.posts || []).filter((p) => p.saved);
  const tiles = tab === 'saved' ? saved : mine;

  const save = async (extra = {}) => {
    try {
      await profileActions.update(api, { name, bio, ...extra });
      await reload();
      setEditing(false);
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  };

  const avatar = async () => {
    const file = await pickAvatarAndUpload(api);
    if (!file?.url) return;
    setAvatarPreview(file.url);
    await save({ avatarUrl: file.url });
  };

  const closeMenuThen = (fn) => {
    setMenu(false);
    setTimeout(fn, 120);
  };

  const openLegal = (path) => closeMenuThen(() => Linking.openURL(`${API_URL}${path}`));


  const confirmLogout = () => closeMenuThen(() => Alert.alert(
    'Выйти из аккаунта?',
    'Вы вернётесь на экран входа. Профиль можно открыть снова по номеру телефона.',
    [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: () => onLogout?.() },
    ]
  ));

  const confirmDeleteAccount = () => closeMenuThen(() => Alert.alert(
    'Удалить аккаунт?',
    'Профиль, публикации, истории, видео, диалоги и загруженные файлы будут удалены.',
    [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await profileActions.deleteAccount(api);
            await onLogout?.();
          } catch (e) {
            Alert.alert('Ошибка', e.message || 'Не удалось удалить аккаунт');
          } finally {
            setDeleting(false);
          }
        }
      },
    ]
  ));

  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 122 }}>
        <View style={styles.top}>
          <Text style={styles.topTitle}>Профиль</Text>
          <View style={styles.topActions}>
            <Pressable onPress={() => setMenu(true)} style={[styles.topIcon, { backgroundColor: palette.surface, borderColor: palette.line }]} accessibilityRole="button" accessibilityLabel="Меню профиля">
              <Icon name="more" size={22} color={palette.ink} />
            </Pressable>
            <Pressable onPress={() => setActive('messages')} style={[styles.topMail, { backgroundColor: isDark ? '#000000' : colors.white, borderColor: isDark ? palette.line : colors.white }]} accessibilityRole="button" accessibilityLabel="Открыть сообщения">
              <MailIcon />
            </Pressable>
          </View>
        </View>

        <Card className="mx-4 rounded-[30px] border-border bg-card p-0">
          <CardContent className="px-5 py-5">
            <View style={styles.heroTop}>
              <Pressable onPress={avatar} style={styles.avatarEdit} accessibilityRole="button" accessibilityLabel="Изменить аватар">
                <Avatar user={viewUser} size={96} />
                <View style={styles.avatarBadge}><Text style={styles.avatarBadgeText}>+</Text></View>
              </Pressable>
              <View style={styles.heroMeta}>
                <Text style={styles.name}>{viewUser.name || 'Без имени'}</Text>
                <Text style={styles.handle}>{viewUser.handle || '@user'}</Text>
                {viewUser.bio ? <Text style={styles.bio}>{viewUser.bio}</Text> : null}
                {!editing ? (
                  <Button variant="outline" className="mt-3 rounded-full" onPress={() => setEditing(true)} accessibilityLabel="Редактировать профиль">
                    <Text>Редактировать профиль</Text>
                  </Button>
                ) : null}
              </View>
            </View>

            <View style={[styles.statsRow, { backgroundColor: palette.surfaceSoft }]}>
              <Stat value={viewUser.postsCount || 0} label="Близзы" />
              <Stat value={viewUser.followers || 0} label="Подписчики" />
              <Stat value={viewUser.following || 0} label="Подписки" />
            </View>

            {editing ? (
              <View style={styles.editBox}>
                <TextField label="Имя" value={name} onChangeText={setName} />
                <TextField label="О себе" value={bio} onChangeText={setBio} multiline />
                <View style={styles.editActions}>
                  <Button variant="outline" className="flex-1 rounded-full" onPress={() => setEditing(false)} accessibilityLabel="Отменить редактирование">
                    <Text>Отмена</Text>
                  </Button>
                  <Button className="flex-1 rounded-full" onPress={() => save()} accessibilityLabel="Сохранить профиль">
                    <Text>Сохранить</Text>
                  </Button>
                </View>
              </View>
            ) : null}
          </CardContent>
        </Card>

        <View style={styles.segmentWrap}>
          <View style={[styles.segment, { backgroundColor: palette.surface, borderColor: palette.line }]}>
            <SegmentTab label="Мои фото" on={tab === 'posts'} onPress={() => setTab('posts')} />
            <SegmentTab label="Сохранённые" on={tab === 'saved'} onPress={() => setTab('saved')} />
          </View>
        </View>

        <View style={styles.grid}>
          {tiles.length ? tiles.map((post) => {
            const source = mediaSource(post);
            return (
              <View key={post.id} style={styles.tileWrap}>
                {source ? <Image source={source} style={styles.tile} /> : <View style={[styles.tile, styles.tilePlaceholder]} />}
              </View>
            );
          }) : (
            <Card className="mt-1 rounded-[26px] border-border bg-card p-0" style={{ width: '100%' }}><CardContent className="items-center px-5 py-7"><Text style={styles.emptyTileTitle}>{tab === 'saved' ? 'Нет сохранённых' : 'Нет публикаций'}</Text></CardContent></Card>
          )}
        </View>
      </ScrollView>

      <ProfileMenu
        visible={menu}
        onClose={() => setMenu(false)}
        palette={palette}
        isDark={isDark}
        deleting={deleting}
        onPrivacy={() => openLegal('/privacy')}
        onTerms={() => openLegal('/terms')}
        onCommunity={() => openLegal('/community-guidelines')}
        onModeration={() => openLegal('/moderation-policy')}
        onSupport={() => openLegal('/support')}
        onLogout={confirmLogout}
        onDelete={confirmDeleteAccount}
      />
    </View>
  );
}


function ProfileMenu({ visible, onClose, isDark, deleting, onPrivacy, onTerms, onCommunity, onModeration, onSupport, onLogout, onDelete }) {
  const insets = useSafeAreaInsets();
  const sheetBg = isDark ? '#07070B' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#15142D';
  const mutedColor = isDark ? '#B8B3C8' : '#7D7890';
  const rowBg = isDark ? '#111118' : '#F8F6FF';
  const borderColor = isDark ? 'rgba(255,255,255,.14)' : '#ECE8F6';

  const rows = [
    ['Политика конфиденциальности', onPrivacy],
    ['Пользовательское соглашение', onTerms],
    ['Правила сообщества', onCommunity],
    ['Политика модерации', onModeration],
    ['Поддержка', onSupport],
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} accessibilityViewIsModal>
      <View style={styles.menuRoot}>
        <Pressable
          style={[styles.menuBackdrop, { backgroundColor: isDark ? 'rgba(0,0,0,.52)' : 'rgba(15,12,28,.20)' }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Закрыть меню профиля"
        />
        <View style={[styles.menuSheet, { backgroundColor: sheetBg, borderColor, paddingBottom: Math.max(insets.bottom, 10) + 12 }]}> 
          <View style={[styles.menuGrabber, { backgroundColor: isDark ? 'rgba(255,255,255,.16)' : '#ECE8F6' }]} />
          <View style={styles.menuHeader}>
            <View style={styles.menuTitleBox}>
              <RNText style={[styles.menuTitle, { color: textColor }]}>Профиль</RNText>
              <RNText style={[styles.menuSubtitle, { color: mutedColor }]}>Документы и аккаунт</RNText>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={[styles.menuClose, { backgroundColor: isDark ? '#14141C' : '#F6F2FF' }]} accessibilityRole="button" accessibilityLabel="Закрыть">
              <Icon name="close" size={23} color={textColor} />
            </Pressable>
          </View>

          <View style={styles.menuList}>
            {rows.map(([label, onPress]) => (
              <Pressable
                key={label}
                onPress={onPress}
                style={({ pressed }) => [styles.profileMenuItem, { backgroundColor: rowBg, borderColor }, pressed && { opacity: 0.72 }]}
                accessibilityRole="button"
                accessibilityLabel={label}
              >
                <RNText style={[styles.profileMenuItemText, { color: textColor }]}>{label}</RNText>
              </Pressable>
            ))}

            <Pressable
              disabled={deleting}
              onPress={onLogout}
              style={({ pressed }) => [styles.profileMenuItem, styles.profileMenuLogout, { borderColor, backgroundColor: isDark ? 'rgba(255,255,255,.06)' : '#FFFFFF' }, pressed && { opacity: 0.72 }, deleting && { opacity: 0.55 }]}
              accessibilityRole="button"
              accessibilityLabel="Выйти из аккаунта"
            >
              <RNText style={[styles.logoutRowText, { color: textColor }]}>Выйти из аккаунта</RNText>
            </Pressable>
            <Pressable
              disabled={deleting}
              onPress={onDelete}
              style={({ pressed }) => [styles.profileMenuItem, styles.profileMenuDelete, { borderColor: isDark ? 'rgba(255,70,110,.32)' : 'rgba(230,40,80,.18)', backgroundColor: isDark ? 'rgba(255,70,110,.12)' : 'rgba(255,70,110,.08)' }, pressed && { opacity: 0.72 }, deleting && { opacity: 0.55 }]}
              accessibilityRole="button"
              accessibilityLabel="Удалить аккаунт"
            >
              <RNText style={styles.deleteRowText}>{deleting ? 'Удаление...' : 'Удалить аккаунт'}</RNText>
            </Pressable>
          </View>

          <Pressable onPress={onClose} style={[styles.menuCancel, { backgroundColor: isDark ? '#14141C' : '#F6F2FF' }]} accessibilityRole="button" accessibilityLabel="Отмена">
            <RNText style={[styles.menuCancelText, { color: textColor }]}>Отмена</RNText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SegmentTab({ on, label, onPress }) {
  const { palette, isDark } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.segmentTab, on && { backgroundColor: isDark ? 'rgba(242,45,143,.24)' : colors.softPink }]}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
    >
      <Text style={[styles.segmentText, { color: on ? colors.hot : palette.muted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  top: {
    paddingHorizontal: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topTitle: { color: colors.ink, fontSize: 32, fontWeight: '900' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  topMail: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarEdit: { position: 'relative' },
  avatarBadge: { position: 'absolute', right: 0, bottom: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  avatarBadgeText: { color: colors.white, fontSize: 20, fontWeight: '900', marginTop: -2 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  heroMeta: { flex: 1 },
  name: { color: colors.ink, fontSize: 24, fontWeight: '900' },
  handle: { color: colors.hot, fontSize: 14, fontWeight: '800', marginTop: 3 },
  bio: { color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 10 },
  statsRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', marginTop: 2, textAlign: 'center' },
  editBox: { marginTop: 18 },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  segmentWrap: { paddingHorizontal: 18, marginTop: 18, marginBottom: 12 },
  segment: { flexDirection: 'row', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 4 },
  segmentTab: { flex: 1, minHeight: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  segmentTabActive: { backgroundColor: colors.softPink },
  segmentText: { color: colors.muted, fontSize: 13, fontWeight: '900' },
  segmentTextActive: { color: colors.hot },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, gap: 6 },
  tileWrap: { width: '31.9%' },
  tile: { width: '100%', aspectRatio: 1, borderRadius: 18, backgroundColor: colors.faint },
  tilePlaceholder: { borderWidth: 1, borderColor: colors.line },
  emptyTileTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  documentRow: {
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  documentLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
    paddingRight: 12,
  },
  documentChevron: {
    fontSize: 25,
    fontWeight: '900',
    marginTop: -1,
  },
  deleteAccountButton: {
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRoot: { flex: 1, justifyContent: 'flex-end' },
  menuBackdrop: { ...StyleSheet.absoluteFillObject },
  menuSheet: {
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  menuGrabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 999, marginBottom: 14 },
  menuHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 2, paddingBottom: 12 },
  menuTitleBox: { flex: 1, minWidth: 0 },
  menuTitle: { fontSize: 24, fontWeight: '900' },
  menuSubtitle: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  menuClose: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  menuList: { gap: 9 },
  profileMenuItem: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  profileMenuItemText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
    textAlign: 'left',
  },
  profileMenuLogout: {
    alignItems: 'center',
    marginTop: 4,
  },
  logoutRowText: { fontSize: 16, fontWeight: '900', textAlign: 'center' },
  profileMenuDelete: {
    alignItems: 'center',
    marginTop: 4,
  },
  menuRow: {
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuRowText: { flex: 1, fontSize: 16, lineHeight: 21, fontWeight: '900', paddingRight: 12 },
  menuChevron: { fontSize: 24, fontWeight: '900', marginTop: -1 },
  deleteRow: { marginTop: 4, justifyContent: 'center' },
  deleteRowText: { color: colors.danger, fontSize: 16, fontWeight: '900', textAlign: 'center' },
  menuCancel: { height: 52, marginTop: 12, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  menuCancelText: { fontSize: 16, fontWeight: '900' },
});
