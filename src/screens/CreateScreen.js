import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { placeActions, postActions, storyActions, videoActions } from '../api/actions';
import { assets } from '../assets';
import { MediaView } from '../components/media/MediaView';
import { TextField } from '../components/ui/TextField';
import { bottomInset, buttonShadow, cardShadow, colors, topInset } from '../theme';
import { MEDIA_LIMITS, bytesLabel } from '../config/mediaLimits';
import { pickAndUpload } from '../utils/picker';

const tabs = [['post','Пост'], ['story','История'], ['video','Видео'], ['place','Место']];
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
  const limitsText = isVideo ? `до ${MEDIA_LIMITS.videoMaxDurationSec} сек · до ${bytesLabel(MEDIA_LIMITS.videoMaxBytes)}` : `сжатие до ${MEDIA_LIMITS.imageMaxDimension}px`;
  const submit = async () => {
    if (['post','story','video'].includes(kind) && !media?.url) {
      Alert.alert('Нужно выбрать медиа', isVideo ? 'Выберите видео из галереи.' : 'Выберите фото из галереи.');
      return;
    }
    if (!caption.trim() && kind === 'place') { Alert.alert('Название места', 'Введите название места.'); return; }
    setBusy(true);
    try {
      const isPickedVideo = media?.mediaType === 'video';
      const payload = { caption, location, imageUrl: isPickedVideo ? '' : media?.url, videoUrl: isPickedVideo ? media?.url : '', mood, title: caption };
      if (kind === 'post') await postActions.create(api, payload);
      if (kind === 'story') await storyActions.create(api, payload);
      if (kind === 'video') await videoActions.create(api, { ...payload, videoUrl: media?.url });
      if (kind === 'place') await placeActions.create(api, { name: caption, address: location, imageUrl: media?.url });
      await reload(); setActive(kind === 'video' ? 'video' : kind === 'place' ? 'nearby' : 'feed');
    } catch (e) { Alert.alert('Не удалось сохранить', e.message); }
    finally { setBusy(false); }
  };
  return <View style={styles.wrap}><View style={styles.blob} /><ScrollView contentContainerStyle={styles.content}>
    <Image source={assets.headerLogo} style={styles.logo} resizeMode="contain" />
    <Text style={styles.title}>Добавить Миг</Text>
    <View style={styles.tabs}>{tabs.map(([key, label]) => <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: kind === key }} onPress={() => setKind(key)} style={[styles.tab, kind === key && styles.tabOn]}><Text style={[styles.tabText, kind === key && styles.tabTextOn]}>{label}</Text></Pressable>)}</View>
    <View style={styles.card}>
      <TextField label={kind === 'place' ? 'Название места' : 'Текст'} value={caption} onChangeText={setCaption} placeholder="Напишите что-нибудь" multiline />
      <TextField label="Локация / описание" value={location} onChangeText={setLocation} placeholder="Город, место или описание" />
      {kind === 'story' ? <View style={styles.moods}>{moods.map(([key, label]) => <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: mood === key }} onPress={() => setMood(key)} style={[styles.mood, mood === key && styles.moodActive]}><Text style={[styles.moodText, mood === key && styles.moodOn]}>{label}</Text></Pressable>)}</View> : null}
      {media?.url ? <MediaView item={media} style={styles.preview} controls muted={false} /> : null}
      <Pressable accessibilityRole="button" onPress={choose} style={styles.media}><Text style={styles.mediaText}>{media ? 'Заменить медиа' : isVideo ? 'Выбрать видео из галереи' : 'Выбрать фото из галереи'}</Text></Pressable>
      <Text style={styles.limit}>{limitsText}</Text>
      <Pressable accessibilityRole="button" disabled={busy} onPress={submit} style={[styles.submit, busy && { opacity: .6 }]}><Text style={styles.submitText}>{busy ? 'Сохраняем...' : 'Опубликовать'}</Text></Pressable>
    </View>
  </ScrollView></View>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  blob: { position: 'absolute', top: 75, right: -78, width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(123,92,255,.07)' },
  content: { paddingTop: topInset + 18, paddingHorizontal: 18, paddingBottom: bottomInset + 116 },
  logo: { width: 112, height: 46, marginBottom: 16 },
  title: { fontSize: 30, lineHeight: 36, color: colors.ink, fontWeight: '900', marginBottom: 16 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tab: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 19, backgroundColor: colors.faint, borderWidth: 1, borderColor: 'transparent' },
  tabOn: { backgroundColor: colors.softPink, borderColor: 'rgba(242,45,143,.16)' },
  tabText: { color: colors.muted, fontWeight: '900', fontSize: 15 },
  tabTextOn: { color: colors.hot },
  card: { borderRadius: 30, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 16, ...cardShadow },
  preview: { height: 210, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.faint, marginBottom: 12 },
  media: { height: 50, borderRadius: 25, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  mediaText: { color: colors.ink, fontWeight: '900' },
  limit: { color: colors.muted, fontWeight: '700', fontSize: 12, marginTop: 7, textAlign: 'center' },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  mood: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 17, backgroundColor: colors.faint },
  moodActive: { backgroundColor: colors.softPink },
  moodText: { color: colors.muted, fontWeight: '800' },
  moodOn: { color: colors.hot },
  submit: { height: 54, marginTop: 20, borderRadius: 27, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center', ...buttonShadow },
  submitText: { color: colors.white, fontSize: 16, fontWeight: '900' }
});
