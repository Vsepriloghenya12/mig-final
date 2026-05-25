import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ResizeMode } from 'expo-av';
import { placeActions, postActions, storyActions, videoActions } from '../api/actions';
import { assets } from '../assets';
import { MediaView } from '../components/media/MediaView';
import { Icon } from '../components/ui/MigIcon';
import { Text } from '../components/ui/text';
import { colors } from '../theme';
import { useTheme } from '../theme-context';
import { isVideoMedia } from '../utils/media';
import { pickAndUpload } from '../utils/picker';

const modes = {
  post: { title: 'Пост', caption: 'Подпись', cta: 'Опубликовать', target: 'feed', pick: 'mixed' },
  story: { title: 'Близз', caption: 'Подпись', cta: 'Опубликовать', target: 'feed', pick: 'mixed' },
  video: { title: 'Видео', caption: 'Описание', cta: 'Опубликовать', target: 'video', pick: 'video' },
};

const modeOrder = ['post', 'story', 'video'];

function normalizeInitial(initial) {
  if (initial === 'create' || initial === 'story') return 'story';
  if (initial === 'video') return 'video';
  if (initial === 'post') return 'post';
  if (initial === 'place') return 'place';
  return 'story';
}

export function CreateScreen({ api, reload, setActive, setData, initial = 'story' }) {
  const [kind, setKind] = useState(normalizeInitial(initial));
  const [caption, setCaption] = useState('');
  const [placeAddress, setPlaceAddress] = useState('');
  const [media, setMedia] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cameraOpening, setCameraOpening] = useState(false);
  const launchedRef = useRef(false);
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isPlace = kind === 'place';
  const current = modes[kind] || modes.story;

  const mediaLabel = useMemo(() => {
    if (!media?.url) return '';
    return isVideoMedia(media) ? 'Видео готово' : 'Медиа готово';
  }, [media]);

  useEffect(() => {
    if (isPlace || launchedRef.current) return;
    launchedRef.current = true;
    const timer = setTimeout(() => openCamera(), 280);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlace]);

  const setMode = (nextKind) => {
    setKind(nextKind);
    if (nextKind === 'video' && media && !isVideoMedia(media)) setMedia(null);
  };

  const pick = async (source) => {
    setCameraOpening(source === 'camera');
    try {
      const next = await pickAndUpload(api, current.pick || 'mixed', source);
      if (next?.url) setMedia(next);
    } catch (e) {
      Alert.alert('Не удалось выбрать файл', e.message || 'Попробуйте ещё раз.');
    } finally {
      setCameraOpening(false);
    }
  };

  const openCamera = () => pick('camera');
  const openLibrary = () => pick('library');

  const applyResponse = async (response, target) => {
    if (response?.posts || response?.videos || response?.stories) setData?.(response);
    else await reload();
    setActive(target);
  };

  const submit = async () => {
    const text = caption.trim();
    if (isPlace && !text) return Alert.alert('Название места', 'Введите название места.');
    if (kind === 'story' && !media?.url) return Alert.alert('Нужно медиа', 'Снимите или выберите фото/видео.');
    if (kind === 'video' && (!media?.url || !isVideoMedia(media))) return Alert.alert('Нужно видео', 'Снимите или выберите видео.');
    if (kind === 'post' && !text && !media?.url) return Alert.alert('Пустой пост', 'Добавьте текст или медиа.');

    setBusy(true);
    try {
      const pickedVideo = isVideoMedia(media);
      const payload = {
        caption: text,
        linkUrl: '',
        location: '',
        imageUrl: pickedVideo ? '' : media?.url || '',
        videoUrl: pickedVideo ? media?.url || '' : '',
        title: text,
      };
      let response;
      if (kind === 'post') response = await postActions.create(api, payload);
      if (kind === 'story') response = await storyActions.create(api, { ...payload, mood: 'joy' });
      if (kind === 'video') response = await videoActions.create(api, { ...payload, videoUrl: media?.url });
      if (kind === 'place') response = await placeActions.create(api, { name: text, address: placeAddress.trim(), imageUrl: media?.url || '' });
      await applyResponse(response, isPlace ? 'nearby' : current.target);
    } catch (e) {
      Alert.alert('Не удалось сохранить', e.message);
    } finally {
      setBusy(false);
    }
  };

  if (isPlace) {
    return (
      <View style={[styles.wrap, { backgroundColor: palette.bg }]}> 
        <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 124 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Image source={isDark ? assets.headerLogoTransparent : assets.headerLogo} style={styles.logo} resizeMode="contain" />
          <Field label="Название" value={caption} onChangeText={setCaption} />
          <Field label="Адрес" value={placeAddress} onChangeText={setPlaceAddress} />
          <CaptureRow onCamera={openCamera} onLibrary={openLibrary} cameraText="Снять" />
          {media?.url ? <MediaView item={media} style={styles.preview} controls muted={false} resizeMode={ResizeMode.CONTAIN} /> : null}
          <PrimaryButton title={busy ? 'Сохраняем...' : 'Добавить'} disabled={busy} onPress={submit} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }]}> 
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 128 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Image source={isDark ? assets.headerLogoTransparent : assets.headerLogo} style={styles.logo} resizeMode="contain" />
        <View style={styles.modeRow}>
          {modeOrder.map((key) => <ModeButton key={key} title={modes[key].title} active={kind === key} onPress={() => setMode(key)} />)}
        </View>

        {!media?.url ? (
          <View style={styles.cameraPanel}>
            <Pressable onPress={openCamera} style={[styles.shutter, { borderColor: palette.line }]} accessibilityRole="button" accessibilityLabel="Открыть камеру">
              <View style={styles.shutterInner} />
            </Pressable>
            <Text style={[styles.cameraText, { color: palette.ink }]}>{cameraOpening ? 'Открываем камеру...' : 'Камера'}</Text>
            <CaptureRow onCamera={openCamera} onLibrary={openLibrary} cameraText="Снять" />
          </View>
        ) : (
          <View>
            <Text style={[styles.readyLabel, { color: palette.muted }]}>{mediaLabel}</Text>
            <MediaView item={media} style={styles.preview} controls muted={false} resizeMode={ResizeMode.CONTAIN} />
            <CaptureRow onCamera={openCamera} onLibrary={openLibrary} cameraText="Переснять" />
            <Field label={current.caption} value={caption} onChangeText={setCaption} multiline autoFocus />
            <PrimaryButton title={busy ? 'Публикуем...' : current.cta} disabled={busy} onPress={submit} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ModeButton({ title, active, onPress }) {
  const { palette } = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.modeButton} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <Text style={[styles.modeText, { color: active ? palette.ink : palette.muted }]}>{title}</Text>
      <View style={[styles.modeLine, active && styles.modeLineActive]} />
    </Pressable>
  );
}

function Field({ label, style, ...props }) {
  const { palette } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: palette.ink }]}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.muted}
        style={[styles.input, { color: palette.ink, borderColor: palette.line }, props.multiline && styles.textarea, style]}
        textAlignVertical={props.multiline ? 'top' : 'center'}
        {...props}
      />
    </View>
  );
}

function CaptureRow({ onCamera, onLibrary, cameraText = 'Снять' }) {
  const { palette } = useTheme();
  return (
    <View style={styles.captureRow}>
      <Pressable onPress={onCamera} style={[styles.captureButton, { borderColor: palette.line }]} accessibilityRole="button" accessibilityLabel={cameraText}>
        <Icon name="image" size={28} active />
        <Text style={[styles.captureText, { color: palette.ink }]}>{cameraText}</Text>
      </Pressable>
      <Pressable onPress={onLibrary} style={[styles.captureButton, { borderColor: palette.line }]} accessibilityRole="button" accessibilityLabel="Загрузить из галереи">
        <Text style={[styles.galleryIcon, { color: palette.ink }]}>+</Text>
        <Text style={[styles.captureText, { color: palette.ink }]}>Галерея</Text>
      </Pressable>
    </View>
  );
}

function PrimaryButton({ title, disabled, onPress }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.primaryButton, disabled && styles.disabled]} accessibilityRole="button" accessibilityState={{ disabled }}>
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 24 },
  logo: { width: 146, height: 50, marginBottom: 18 },
  modeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 22 },
  modeButton: { minHeight: 44, justifyContent: 'center' },
  modeText: { color: colors.muted, fontSize: 19, fontWeight: '900' },
  modeLine: { height: 3, borderRadius: 99, marginTop: 8, backgroundColor: 'transparent' },
  modeLineActive: { backgroundColor: colors.hot },
  cameraPanel: { minHeight: 460, alignItems: 'center', justifyContent: 'center' },
  shutter: { width: 118, height: 118, borderRadius: 59, borderWidth: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  shutterInner: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.hot },
  cameraText: { fontSize: 20, fontWeight: '900', marginBottom: 22 },
  captureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
  captureButton: { flex: 1, minHeight: 58, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  captureText: { fontSize: 15, fontWeight: '900' },
  galleryIcon: { fontSize: 28, fontWeight: '900', marginTop: -2 },
  readyLabel: { fontSize: 13, fontWeight: '900', textTransform: 'uppercase', marginBottom: 10 },
  preview: { height: 330, borderRadius: 20, overflow: 'hidden', backgroundColor: 'transparent', marginBottom: 14 },
  field: { marginBottom: 22 },
  label: { color: colors.ink, fontSize: 18, fontWeight: '900', marginBottom: 10 },
  input: { minHeight: 52, color: colors.ink, fontSize: 17, fontWeight: '700', paddingHorizontal: 14, borderWidth: 1, borderRadius: 18 },
  textarea: { minHeight: 132, paddingTop: 12, lineHeight: 23 },
  primaryButton: { minHeight: 56, borderRadius: 999, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryButtonText: { color: colors.white, fontSize: 16, fontWeight: '900' },
  disabled: { opacity: 0.55 },
});
