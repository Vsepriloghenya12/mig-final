import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { profileActions } from '../api/actions';
import { Avatar } from '../components/ui/Avatar';
import { TextField } from '../components/ui/TextField';
import { colors, topInset } from '../theme';
import { mediaSource } from '../utils/media';
import { pickAndUpload } from '../utils/picker';

export function ProfileScreen({ data, api, reload, setActive }) {
  const user = data?.currentUser || {};
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState('posts');
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const mine = (data?.posts || []).filter((p) => p.author?.id === user.id);
  const saved = (data?.posts || []).filter((p) => p.saved);
  const tiles = tab === 'saved' ? saved : mine;
  const save = async (extra = {}) => { try { await profileActions.update(api, { name, bio, ...extra }); await reload(); setEditing(false); } catch (e) { Alert.alert('Ошибка', e.message); } };
  const avatar = async () => { const file = await pickAndUpload(api, 'image'); if (file?.url) await save({ avatarUrl: file.url }); };
  return <View style={styles.wrap}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.top}><Text style={styles.title}>Профиль</Text><Pressable onPress={() => setActive('messages')}><Text style={styles.msg}>Сообщения</Text></Pressable></View>
    <View style={styles.profile}><Pressable onPress={avatar}><Avatar user={user} size={82} /></Pressable><Stat value={user.postsCount || 0} label="Миги" /><Stat value={user.followers || 0} label="Подписчики" /><Stat value={user.following || 0} label="Подписки" /></View>
    {editing ? <View style={styles.edit}><TextField label="Имя" value={name} onChangeText={setName} /><TextField label="О себе" value={bio} onChangeText={setBio} multiline /><Pressable onPress={() => save()} style={styles.save}><Text style={styles.saveText}>Сохранить</Text></Pressable></View> : <Info user={user} onEdit={() => setEditing(true)} />}
    <View style={styles.tabs}><Tab on={tab === 'posts'} label="Фото" onPress={() => setTab('posts')} /><Tab on={tab === 'saved'} label="Сохранённые" onPress={() => setTab('saved')} /></View>
    <View style={styles.grid}>{tiles.map((post) => { const source = mediaSource(post); return source ? <Image key={post.id} source={source} style={styles.tile} /> : null; })}</View>
  </ScrollView></View>;
}
function Stat({ value, label }) { return <View style={styles.stats}><Text style={styles.stat}>{value}</Text><Text style={styles.label}>{label}</Text></View>; }
function Tab({ on, label, onPress }) { return <Pressable onPress={onPress}><Text style={on ? styles.tabOn : styles.tab}>{label}</Text></Pressable>; }
function Info({ user, onEdit }) { return <><Text style={styles.name}>{user.name}</Text><Text style={styles.bio}>{user.bio || 'Расскажите о себе'}</Text><Pressable onPress={onEdit} style={styles.button}><Text style={styles.buttonText}>Редактировать профиль</Text></Pressable></>; }

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { paddingTop: topInset + 10, paddingBottom: 120 },
  top: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26, color: colors.ink, fontWeight: '900' },
  msg: { color: colors.hot, fontWeight: '900' },
  profile: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, gap: 22 },
  stats: { alignItems: 'center', flex: 1 },
  stat: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  label: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  name: { paddingHorizontal: 20, marginTop: 16, fontSize: 20, fontWeight: '900', color: colors.ink },
  bio: { paddingHorizontal: 20, color: colors.text, marginTop: 5, lineHeight: 20 },
  button: { marginHorizontal: 20, marginTop: 16, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  buttonText: { color: colors.ink, fontWeight: '900' },
  edit: { padding: 20 },
  save: { backgroundColor: colors.hot, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: colors.white, fontWeight: '900' },
  tabs: { flexDirection: 'row', gap: 20, paddingHorizontal: 20, marginTop: 18, marginBottom: 8 },
  tab: { color: colors.muted, fontWeight: '900' },
  tabOn: { color: colors.hot, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { width: '33.333%', aspectRatio: 1, borderWidth: .5, borderColor: colors.bg }
});
