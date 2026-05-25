import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { chatApi } from '../api/chat';
import { profileActions } from '../api/actions';
import { ActionSheet, ActionSheetItem } from '../components/ui/action-sheet';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { BrandActionIcon } from '../components/ui/BrandActionIcon';
import { Icon } from '../components/ui/MigIcon';
import { Text } from '../components/ui/text';
import { useTheme } from '../theme-context';
import { colors } from '../theme';
import { mediaSource } from '../utils/media';
import { blockUser, reportContent } from '../utils/moderation';

export function UserProfileScreen({ user, data, api, reload, onBack, openChat }) {
  const [menu, setMenu] = useState(false);
  const posts = (data?.posts || []).filter((p) => p.author?.id === user?.id);
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const follow = async () => { try { await profileActions.follow(api, user.id); await reload(); } catch (e) { Alert.alert('Ошибка', e.message); } };
  const message = async () => { const d = await chatApi.openDialog(api, user.id); openChat(d.dialog.id, user); };
  const report = () => { setMenu(false); reportContent(api, { targetType: 'profile', targetId: user.id, targetUserId: user.id }); };
  const block = () => { setMenu(false); blockUser(api, user.id, async () => { await reload(); onBack?.(); }); };

  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 120 }}>
        <View style={styles.head}>
          <Pressable onPress={onBack} style={[styles.headBtn, { backgroundColor: palette.surface, borderColor: palette.line }]} accessibilityRole="button" accessibilityLabel="Назад">
            <Icon name="back" size={25} color={palette.ink} />
          </Pressable>
          <Text numberOfLines={1} style={styles.headTitle}>{user?.handle || user?.name || 'Профиль'}</Text>
          <Pressable onPress={() => setMenu(true)} style={[styles.headBtn, { backgroundColor: palette.surface, borderColor: palette.line }]} accessibilityRole="button" accessibilityLabel="Действия с профилем">
            <Icon name="more" size={20} color={palette.ink} />
          </Pressable>
        </View>

        <View style={styles.profileTop}>
          <View style={styles.avatarBox}>
            <Avatar user={user} size={92} ringColor={colors.hot} />
          </View>
          <View style={styles.statsRow}>
            <Stat value={posts.length} label="Близзы" />
            <Stat value={user?.followers || 0} label="Подписчики" />
            <Stat value={user?.following || 0} label="Подписки" />
          </View>
        </View>

        <View style={styles.bioBlock}>
          <Text numberOfLines={1} style={styles.name}>{user?.name || 'Пользователь'}</Text>
          <Text numberOfLines={1} style={styles.handle}>{user?.handle || '@user'}</Text>
          <Text style={styles.bio}>{user?.bio || 'Профиль пользователя в Близз'}</Text>
        </View>

        <View style={styles.actions}>
          <Button onPress={follow} className="flex-1 rounded-xl" accessibilityLabel="Подписаться">
            <Text>{user?.isFollowing ? 'Отписаться' : 'Подписаться'}</Text>
          </Button>
          <Button variant="outline" onPress={message} className="flex-1 rounded-xl" accessibilityLabel="Написать">
            <Text>Сообщение</Text>
          </Button>
          <Pressable onPress={() => setMenu(true)} style={styles.smallAction} accessibilityRole="button" accessibilityLabel="Действия">
            <Icon name="more" size={20} color={palette.ink} />
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
            <Card className="rounded-[26px] border-border bg-card p-0" style={{ width: '100%' }}>
              <CardContent className="items-center px-5 py-8">
                <Text style={styles.emptyTitle}>Пока нет публикаций</Text>
                <Text style={styles.emptyText}>Когда пользователь добавит Близз, он появится здесь.</Text>
              </CardContent>
            </Card>
          )}
        </View>
      </ScrollView>

      <ActionSheet visible={menu} title={user?.name || 'Профиль'} description="Действия с этим пользователем" onClose={() => setMenu(false)}>
        <ActionSheetItem icon="more" label="Пожаловаться" description="Отправить профиль на проверку" onPress={report} />
        <ActionSheetItem icon="close" label="Заблокировать" description="Скрыть пользователя из приложения" tone="destructive" onPress={block} />
      </ActionSheet>
    </View>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text numberOfLines={1} style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  head: { minHeight: 56, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  headTitle: { flex: 1, color: colors.ink, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  profileTop: { paddingHorizontal: 18, paddingTop: 14, flexDirection: 'row', alignItems: 'center', gap: 20 },
  avatarBox: { width: 98, alignItems: 'center' },
  statsRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  statLabel: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 3, maxWidth: 86 },
  bioBlock: { paddingHorizontal: 18, paddingTop: 14 },
  name: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  handle: { color: colors.hot, fontSize: 13, fontWeight: '900', marginTop: 3 },
  bio: { color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, marginTop: 16 },
  smallAction: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  tabs: { marginTop: 18, flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, backgroundColor: colors.bg },
  tabActive: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: colors.ink },
  tab: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', opacity: 0.46 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 2, gap: 2, paddingTop: 2 },
  tile: { width: '32.9%', aspectRatio: 1, backgroundColor: colors.faint },
  tileEmpty: { borderWidth: 1, borderColor: colors.line },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  emptyText: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 7 },
});
