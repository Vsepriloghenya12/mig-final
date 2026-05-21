import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { profileActions } from '../api/actions';
import { Avatar } from '../components/ui/Avatar';
import { TextField } from '../components/ui/TextField';
import { colors, topInset } from '../theme';
import { mediaSource } from '../utils/media';

export function ProfileScreen({ data, api, reload, setActive }) {
  const user = data?.currentUser || {};
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const save = async () => { try { await profileActions.update(api, { name, bio }); await reload(); setEditing(false); } catch (e) { Alert.alert('Ошибка', e.message); } };
  const mine = (data?.posts || []).filter((p) => p.author?.id === user.id);
  return <View style={styles.wrap}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.top}><Text style={styles.title}>Профиль</Text><Pressable onPress={() => setActive('messages')}><Text style={styles.msg}>Сообщения</Text></Pressable></View>
    <View style={styles.profile}><Avatar user={user} size={82} /><View style={styles.stats}><Text style={styles.stat}>{user.postsCount || 0}</Text><Text style={styles.label}>Миги</Text></View><View style={styles.stats}><Text style={styles.stat}>{user.followers || 0}</Text><Text style={styles.label}>Подписчики</Text></View><View style={styles.stats}><Text style={styles.stat}>{user.following || 0}</Text><Text style={styles.label}>Подписки</Text></View></View>
    {editing ? <View style={styles.edit}><TextField label="Имя" value={name} onChangeText={setName} /><TextField label="О себе" value={bio} onChangeText={setBio} multiline /><Pressable onPress={save} style={styles.save}><Text style={styles.saveText}>Сохранить</Text></Pressable></View> : <><Text style={styles.name}>{user.name}</Text><Text style={styles.bio}>{user.bio || 'Расскажите о себе'}</Text><Pressable onPress={() => setEditing(true)} style={styles.button}><Text style={styles.buttonText}>Редактировать профиль</Text></Pressable></>}
    <View style={styles.grid}>{mine.map((post) => <Image key={post.id} source={mediaSource(post)} style={styles.tile} />)}</View>
  </ScrollView></View>;
}

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
  button: { margin: 20, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: colors.ink, fontWeight: '900' },
  edit: { padding: 20 },
  save: { backgroundColor: colors.hot, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: colors.white, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  tile: { width: '33.333%', aspectRatio: 1, borderWidth: .5, borderColor: colors.bg }
});
