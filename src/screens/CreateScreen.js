import React, { useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { ResizeMode } from 'expo-av';
import { placeActions, postActions, storyActions, videoActions } from '../api/actions';
import { assets } from '../assets';
import { MEDIA_LIMITS } from '../config/mediaLimits';
import { MediaView } from '../components/media/MediaView';
import { Icon } from '../components/ui/MigIcon';
import { Text } from '../components/ui/text';
import { colors, moodColors } from '../theme';
import { useTheme } from '../theme-context';
import { isVideoMedia } from '../utils/media';
import { pickAndUpload, prepareCameraCapture } from '../utils/picker';

const modes = {
  post: { title: 'Пост', caption: 'Подпись', cta: 'Опубликовать', target: 'feed', pick: 'mixed', cameraMode: 'picture' },
  story: { title: 'Близз', caption: 'Подпись', cta: 'Опубликовать', target: 'feed', pick: 'mixed', cameraMode: 'picture' },
  video: { title: 'Видео', caption: 'Описание', cta: 'Опубликовать', target: 'video', pick: 'video', cameraMode: 'video' },
};

const modeOrder = ['post', 'story', 'video'];
const moodOptions = [
  ['joy', 'Радость'],
  ['love', 'Любовь'],
  ['calm', 'Спокойствие'],
  ['energy', 'Энергия'],
  ['dream', 'Мечта'],
  ['focus', 'Фокус'],
];

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
  const [mood, setMood] = useState('joy');
  const [media, setMedia] = useState(null);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const isPlace = kind === 'place';
  const current = modes[kind] || modes.story;
  const needsMic = kind === 'video';
  const cameraReady = cameraPermission?.granted && (!needsMic || micPermission?.granted);

  const mediaLabel = useMemo(() => {
    if (!media?.url) return '';
    return isVideoMedia(media) ? 'Видео готово' : 'Медиа готово';
  }, [media]);

  const setMode = async (nextKind) => {
    setKind(nextKind);
    if (nextKind === 'video' && !micPermission?.granted) await requestMicPermission();
    if (nextKind === 'video' && media && !isVideoMedia(media)) setMedia(null);
  };

  const ensureCamera = async () => {
    const cam = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();
    if (!cam?.granted) {
      Alert.alert('Камера недоступна', 'Разрешите доступ к камере в настройках телефона.');
      return false;
    }
    if (needsMic) {
      const mic = micPermission?.granted ? micPermission : await requestMicPermission();
      if (!mic?.granted) {
        Alert.alert('Микрофон недоступен', 'Разрешите доступ к микрофону для записи видео.');
        return false;
      }
    }
    return true;
  };

  const uploadCameraAsset = async (asset, type) => {
    const prepared = await prepareCameraCapture(asset, type);
    if (!prepared) return null;
    const uploaded = await api.upload(prepared);
    if (uploaded?.url) setMedia(uploaded);
    return uploaded;
  };

  const capture = async () => {
    if (busy) return;
    if (!(await ensureCamera())) return;
    if (!cameraRef.current) return;
    if (kind === 'video') {
      if (recording) {
        cameraRef.current.stopRecording?.();
        setRecording(false);
        return;
      }
      setRecording(true);
      try {
        const video = await cameraRef.current.recordAsync({ maxDuration: MEDIA_LIMITS.videoMaxDurationSec });
        if (video?.uri) {
          setBusy(true);
          await uploadCameraAsset(video, 'video');
        }
      } catch (e) {
        Alert.alert('Не удалось записать видео', e.message || 'Попробуйте ещё раз.');
      } finally {
        setRecording(false);
        setBusy(false);
      }
      return;
    }

    try {
      setBusy(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.86, skipProcessing: false });
      if (photo?.uri) await uploadCameraAsset(photo, 'image');
    } catch (e) {
      Alert.alert('Не удалось сделать фото', e.message || 'Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  };

  const openLibrary = async () => {
    if (busy) return;
    try {
      setBusy(true);
      const next = await pickAndUpload(api, current.pick || 'mixed', 'library');
      if (next?.url) setMedia(next);
    } catch (e) {
      Alert.alert('Не удалось выбрать файл', e.message || 'Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  };

  const retake = () => {
    setCaption('');
    setMedia(null);
  };

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
      if (kind === 'story') response = await storyActions.create(api, { ...payload, mood });
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
          <CaptureRow onLibrary={openLibrary} onCapture={capture} captureText="Снять" busy={busy} />
          {media?.url ? <MediaView item={media} style={styles.placePreview} controls muted={false} resizeMode={ResizeMode.CONTAIN} /> : null}
          <PrimaryButton title={busy ? 'Сохраняем...' : 'Добавить'} disabled={busy} onPress={submit} />
        </ScrollView>
      </View>
    );
  }

  if (!media?.url) {
    return (
      <View style={styles.cameraScreen}>
        {cameraReady ? (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} mode={current.cameraMode} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.cameraFallback]}>
            <Image source={assets.markLarge} style={styles.permissionLogo} resizeMode="contain" />
            <Text style={styles.permissionTitle}>Нужен доступ к камере</Text>
            <Pressable onPress={ensureCamera} style={styles.permissionButton} accessibilityRole="button" accessibilityLabel="Разрешить камеру">
              <Text style={styles.permissionButtonText}>Разрешить</Text>
            </Pressable>
          </View>
        )}
        <View style={[styles.cameraShadeTop, { paddingTop: insets.top + 12 }]}> 
          <View style={styles.cameraHeader}>
            <Image source={assets.headerLogoTransparent} style={styles.cameraLogo} resizeMode="contain" />
          </View>
          <View style={styles.cameraModes}>
            {modeOrder.map((key) => <CameraModeButton key={key} title={modes[key].title} active={kind === key} onPress={() => setMode(key)} />)}
          </View>
        </View>
        <View style={[styles.cameraShadeBottom, { paddingBottom: insets.bottom + 92 }]}> 
          <Pressable onPress={openLibrary} disabled={busy || recording} style={styles.galleryButton} accessibilityRole="button" accessibilityLabel="Загрузить из галереи">
            <Icon name="image" size={30} active />
            <Text style={styles.galleryText}>Галерея</Text>
          </Pressable>
          <Pressable onPress={capture} disabled={busy} style={[styles.shutter, kind === 'video' && styles.shutterVideo, recording && styles.shutterRecording]} accessibilityRole="button" accessibilityLabel={kind === 'video' ? 'Записать видео' : 'Сделать фото'}>
            <View style={[styles.shutterInner, kind === 'video' && styles.shutterInnerVideo, recording && styles.shutterInnerRecording]} />
          </Pressable>
          <Pressable onPress={() => setFacing((v) => (v === 'back' ? 'front' : 'back'))} disabled={busy || recording} style={styles.flipButton} accessibilityRole="button" accessibilityLabel="Сменить камеру">
            <Text style={styles.flipText}>↺</Text>
          </Pressable>
        </View>
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
        <Text style={[styles.readyLabel, { color: palette.muted }]}>{mediaLabel}</Text>
        {kind === 'story' ? <MoodPicker value={mood} onChange={setMood} /> : null}
        <MediaView item={media} style={styles.preview} controls muted={false} resizeMode={ResizeMode.CONTAIN} />
        <CaptureRow onLibrary={openLibrary} onCapture={retake} captureText="Переснять" busy={busy} />
        <Field label={current.caption} value={caption} onChangeText={setCaption} multiline autoFocus />
        <PrimaryButton title={busy ? 'Публикуем...' : current.cta} disabled={busy} onPress={submit} />
      </ScrollView>
    </View>
  );
}


function MoodPicker({ value, onChange }) {
  const { palette } = useTheme();
  return (
    <View style={styles.moodBlock}>
      <Text style={[styles.label, { color: palette.ink }]}>Настроение</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodRow}>
        {moodOptions.map(([key, title]) => {
          const active = value === key;
          return (
            <Pressable key={key} onPress={() => onChange(key)} style={[styles.moodButton, { borderColor: active ? (moodColors[key] || colors.hot) : palette.line, backgroundColor: active ? (moodColors[key] || colors.hot) : palette.input }]} accessibilityRole="button" accessibilityState={{ selected: active }}>
              <Text style={[styles.moodText, { color: active ? colors.white : palette.ink }]}>{title}</Text>
            </Pressable>
          );
        })}
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

function CameraModeButton({ title, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.cameraModeButton, active && styles.cameraModeActive]} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <Text style={[styles.cameraModeText, active && styles.cameraModeTextActive]}>{title}</Text>
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
        style={[styles.input, { color: palette.ink, borderColor: palette.line, backgroundColor: palette.input }, props.multiline && styles.textarea, style]}
        textAlignVertical={props.multiline ? 'top' : 'center'}
        {...props}
      />
    </View>
  );
}

function CaptureRow({ onCapture, onLibrary, captureText = 'Снять', busy }) {
  const { palette } = useTheme();
  return (
    <View style={styles.captureRow}>
      <Pressable disabled={busy} onPress={onCapture} style={[styles.captureButton, { borderColor: palette.line }]} accessibilityRole="button" accessibilityLabel={captureText}>
        <Icon name="image" size={28} active />
        <Text style={[styles.captureText, { color: palette.ink }]}>{captureText}</Text>
      </Pressable>
      <Pressable disabled={busy} onPress={onLibrary} style={[styles.captureButton, { borderColor: palette.line }]} accessibilityRole="button" accessibilityLabel="Загрузить из галереи">
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
  cameraScreen: { flex: 1, backgroundColor: '#000' },
  cameraFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#090910', paddingHorizontal: 30 },
  permissionLogo: { width: 92, height: 92, marginBottom: 16 },
  permissionTitle: { color: colors.white, fontSize: 22, fontWeight: '900', marginBottom: 18, textAlign: 'center' },
  permissionButton: { minHeight: 52, borderRadius: 26, backgroundColor: colors.hot, paddingHorizontal: 26, alignItems: 'center', justifyContent: 'center' },
  permissionButtonText: { color: colors.white, fontSize: 16, fontWeight: '900' },
  cameraShadeTop: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 18, paddingBottom: 18, backgroundColor: 'rgba(0,0,0,.38)' },
  cameraHeader: { height: 46, justifyContent: 'center' },
  cameraLogo: { width: 134, height: 44 },
  cameraModes: { flexDirection: 'row', alignSelf: 'center', backgroundColor: 'rgba(0,0,0,.36)', borderRadius: 999, padding: 4, gap: 4 },
  cameraModeButton: { minHeight: 38, minWidth: 80, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  cameraModeActive: { backgroundColor: colors.white },
  cameraModeText: { color: 'rgba(255,255,255,.72)', fontSize: 14, fontWeight: '900' },
  cameraModeTextActive: { color: colors.ink },
  cameraShadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 28, paddingTop: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,.42)' },
  galleryButton: { width: 76, alignItems: 'center', justifyContent: 'center', gap: 3 },
  galleryText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  shutter: { width: 84, height: 84, borderRadius: 42, borderWidth: 5, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  shutterVideo: { borderColor: '#ff4f74' },
  shutterRecording: { borderColor: colors.white },
  shutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.white },
  shutterInnerVideo: { backgroundColor: '#ff315f' },
  shutterInnerRecording: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#ff315f' },
  flipButton: { width: 76, height: 54, alignItems: 'center', justifyContent: 'center' },
  flipText: { color: colors.white, fontSize: 34, fontWeight: '900', marginTop: -5 },
  readyLabel: { fontSize: 13, fontWeight: '900', marginBottom: 10 },
  moodBlock: { marginBottom: 16 },
  moodRow: { gap: 10, paddingRight: 22 },
  moodButton: { minHeight: 42, borderRadius: 21, borderWidth: 1, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  moodText: { fontSize: 14, fontWeight: '900' },
  placePreview: { width: '100%', height: 260, borderRadius: 24, overflow: 'hidden', marginTop: 8, backgroundColor: colors.faint },
  preview: { width: '100%', height: 420, borderRadius: 26, overflow: 'hidden', backgroundColor: colors.faint },
  captureRow: { flexDirection: 'row', gap: 12, marginTop: 18, marginBottom: 20 },
  captureButton: { flex: 1, minHeight: 58, borderRadius: 24, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  captureText: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  galleryIcon: { fontSize: 24, fontWeight: '900', marginTop: -2 },
  field: { marginTop: 2, marginBottom: 16 },
  label: { color: colors.ink, fontSize: 16, fontWeight: '900', marginBottom: 8 },
  input: { minHeight: 54, borderRadius: 20, borderWidth: 1, paddingHorizontal: 0, fontSize: 16, fontWeight: '800', backgroundColor: 'transparent' },
  textarea: { minHeight: 112, paddingTop: 12, paddingBottom: 12 },
  primaryButton: { minHeight: 58, borderRadius: 29, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryButtonText: { color: colors.white, fontSize: 16, fontWeight: '900' },
  disabled: { opacity: 0.55 },
});
