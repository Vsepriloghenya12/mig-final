import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { chatApi } from '../api/chat';
import { profileActions } from '../api/actions';
import { Avatar } from '../components/ui/Avatar';
import { Icon } from '../components/ui/Icon';
import { colors, topInset } from '../theme';
import { mediaSource } from '../utils/media';

export function UserProfileScreen({ user, data, api, reload, onBack, openChat }) {
  const posts = (data?.posts || []).filter((p) => p.author?.id === user?.id);
  const follow = async () => { try { await profileActions.follow(api, user.id); await reload(); } catch (e) { Alert.alert('Ошибка', e.message); } };
  const message = async () => { const d = await chatApi.openDialog(api, user.id); openChat(d.dialog.id, user); };
  return <View style={styles.wrap}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.head}><Pressable onPress={onBack}><Icon name="back" size={34} /></Pressable><Text style={styles.title}>{user?.handle || 'Профиль'}</Text></View>
    <View style={styles.profile}><Avatar user={user} size={86} /><View style={styles.stats}><Text style={styles.stat}>{posts.length}</Text><Text style={styles.label}>Миги</Text></View><View style={styles.stats}><Text style={styles.stat}>{user?.followers || 0}</Text><Text style={styles.label}>Подписчики</Text></View><View style={styles.stats}><Text style={styles.stat}>{user?.following || 0}</Text><Text style={styles.label}>Подписки</Text></View></View>
    <Text style={styles.name}>{user?.name || 'Пользователь'}</Text><Text style={styles.bio}>{user?.bio || 'Профиль пользователя'}</Text>
    <View style={styles.actions}><Pressable onPress={follow} style={styles.follow}><Text style={styles.followText}>{user?.isFollowing ? 'Отписаться' : 'Подписаться'}</Text></Pressable><Pressable onPress={message} style={styles.msg}><Text style={styles.msgText}>Написать</Text></Pressable></View>
    <View style={styles.grid}>{posts.map((post) => { const source = mediaSource(post); return source ? <Image key={post.id} source={source} style={styles.tile} /> : null; })}</View>
  </ScrollView></View>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { paddingTop: topInset + 8, paddingBottom: 120 },
  head: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: colors.ink, fontSize: 22, fontWeight: '900' },
  profile: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, gap: 22 },
  stats: { alignItems: 'center', flex: 1 },
  stat: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  label: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  name: { paddingHorizontal: 20, marginTop: 16, fontSize: 20, fontWeight: '900', color: colors.ink },
  bio: { paddingHorizontal: 20, color: colors.text, marginTop: 5, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 16, marginBottom: 18 },
  follow: { flex: 1, height: 42, borderRadius: 21, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center' },
  followText: { color: colors.white, fontWeight: '900' },
  msg: { flex: 1, height: 42, borderRadius: 21, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  msgText: { color: colors.ink, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { width: '33.333%', aspectRatio: 1, borderWidth: .5, borderColor: colors.bg }
});
