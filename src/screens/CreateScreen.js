import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { collectionActions, placeActions, postActions, storyActions, videoActions } from '../api/actions';
import { TextField } from '../components/ui/TextField';
import { colors, topInset } from '../theme';
import { pickAndUpload } from '../utils/picker';

const tabs = [
  ['post', 'Пост'], ['story', 'История'], ['video', 'Видео'], ['place', 'Место'], ['collection', 'Подборка']
];
const moods = [['joy','Радость'], ['love','Любовь'], ['calm','Спокойно'], ['energy','Энергия'], ['dream','Мечта']];

export function CreateScreen({ api, reload, setActive, initial = 'post' }) {
  const [kind, setKind] = useState(initial);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [media, setMedia] = useState(null);
  const [mood, setMood] = useState('joy');
  const [busy, setBusy] = useState(false);
  const isVideo = kind === 'video';
  const choose = async () => setMedia(await pickAndUpload(api, isVideo ? 'video' : 'image'));
  const submit = async () => {
    setBusy(true);
    try {
      const payload = { caption, location, imageUrl: media?.url, videoUrl: media?.url, mood, title: caption };
      if (kind === 'post') await postActions.create(api, payload);
      if (kind === 'story') await storyActions.create(api, payload);
      if (kind === 'video') await videoActions.create(api, payload);
      if (kind === 'place') await placeActions.create(api, { name: caption, address: location, imageUrl: media?.url });
      if (kind === 'collection') await collectionActions.create(api, { title: caption, description: location });
      await reload(); setActive(kind === 'video' ? 'video' : kind === 'place' ? 'nearby' : 'feed');
    } catch (e) { Alert.alert('Не удалось сохранить', e.message); }
    finally { setBusy(false); }
  };
  return <View style={styles.wrap}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Добавить Миг</Text>
    <View style={styles.tabs}>{tabs.map(([key, label]) => <Pressable key={key} onPress={() => setKind(key)} style={[styles.tab, kind === key && styles.tabOn]}><Text style={[styles.tabText, kind === key && styles.tabTextOn]}>{label}</Text></Pressable>)}</View>
    <TextField label={kind === 'place' ? 'Название места' : 'Текст'} value={caption} onChangeText={setCaption} placeholder="Напишите что-нибудь" multiline />
    <TextField label="Локация / описание" value={location} onChangeText={setLocation} placeholder="Москва, кафе, парк..." />
    {kind === 'story' ? <View style={styles.moods}>{moods.map(([key, label]) => <Pressable key={key} onPress={() => setMood(key)} style={[styles.mood, mood === key && styles.moodOn]}><Text style={styles.moodText}>{label}</Text></Pressable>)}</View> : null}
    {kind !== 'collection' ? <Pressable onPress={choose} style={styles.media}><Text style={styles.mediaText}>{media ? 'Медиа выбрано' : isVideo ? 'Выбрать видео из галереи' : 'Выбрать фото из галереи'}</Text></Pressable> : null}
    <Pressable disabled={busy} onPress={submit} style={[styles.submit, busy && { opacity: .6 }]}><Text style={styles.submitText}>{busy ? 'Сохраняем...' : 'Опубликовать'}</Text></Pressable>
  </ScrollView></View>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { paddingTop: topInset + 26, paddingHorizontal: 18, paddingBottom: 120 },
  title: { fontSize: 28, color: colors.ink, fontWeight: '900', marginBottom: 18 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  tab: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: colors.faint },
  tabOn: { backgroundColor: colors.hot },
  tabText: { color: colors.text, fontWeight: '900' },
  tabTextOn: { color: colors.white },
  media: { height: 56, borderRadius: 24, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  mediaText: { color: colors.ink, fontWeight: '900' },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  mood: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 17, backgroundColor: colors.faint },
  moodOn: { backgroundColor: '#FFEAF5' },
  moodText: { color: colors.ink, fontWeight: '800' },
  submit: { height: 58, marginTop: 18, borderRadius: 29, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: colors.white, fontSize: 16, fontWeight: '900' }
});
