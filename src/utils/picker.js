import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { MEDIA_LIMITS, bytesLabel } from '../config/mediaLimits';

function mediaTypesFor(kind = 'image') {
  if (ImagePicker.MediaTypeOptions) {
    if (kind === 'mixed') return ImagePicker.MediaTypeOptions.All;
    if (kind === 'video') return ImagePicker.MediaTypeOptions.Videos;
    return ImagePicker.MediaTypeOptions.Images;
  }
  if (kind === 'mixed') return ['images', 'videos'];
  if (kind === 'video') return ['videos'];
  return ['images'];
}

async function ensureLibraryPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Галерея недоступна', 'Разрешите доступ к фото и видео в настройках телефона.');
    return false;
  }
  return true;
}

async function ensureCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Камера недоступна', 'Разрешите доступ к камере в настройках телефона.');
    return false;
  }
  return true;
}

async function ensurePermission(source) {
  return source === 'camera' ? ensureCameraPermission() : ensureLibraryPermission();
}

export async function pickMedia(kind = 'image', source = 'library', options = {}) {
  if (!(await ensurePermission(source))) return null;
  const mediaTypes = mediaTypesFor(kind);
  const pickerOptions = {
    mediaTypes,
    quality: options.quality ?? 0.82,
    allowsEditing: !!options.allowsEditing,
    aspect: options.aspect,
    videoMaxDuration: MEDIA_LIMITS.videoMaxDurationSec,
    cameraType: ImagePicker.CameraType?.back,
  };
  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync(pickerOptions)
    : await ImagePicker.launchImageLibraryAsync(pickerOptions);
  if (result.canceled) return null;
  const asset = result.assets?.[0] || null;
  if (!asset) return null;
  const selectedType = asset.type || asset.mediaType;
  return selectedType === 'video' ? validateVideo(asset) : compressImage(asset, options.avatar === true);
}

export async function pickAndUpload(api, kind = 'image', source = 'library', options = {}) {
  const asset = await pickMedia(kind, source, options);
  if (!asset) return null;
  return api.upload(asset);
}

export async function pickAvatarAndUpload(api) {
  return pickAndUpload(api, 'image', 'library', { allowsEditing: true, aspect: [1, 1], quality: 0.9, avatar: true });
}

async function compressImage(asset, avatar = false) {
  if (asset.fileSize && asset.fileSize > MEDIA_LIMITS.imageMaxBytes * 2) {
    Alert.alert('Фото слишком большое', `Выберите фото до ${bytesLabel(MEDIA_LIMITS.imageMaxBytes * 2)}.`);
    return null;
  }
  const action = resizeAction(asset.width, asset.height, avatar ? Math.min(MEDIA_LIMITS.imageMaxDimension, 900) : MEDIA_LIMITS.imageMaxDimension);
  const out = await ImageManipulator.manipulateAsync(asset.uri, action ? [action] : [], { compress: avatar ? 0.86 : MEDIA_LIMITS.imageCompress, format: ImageManipulator.SaveFormat.JPEG });
  return { ...asset, ...out, mimeType: 'image/jpeg', type: 'image', fileName: `blizz-${Date.now()}.jpg` };
}

function validateVideo(asset) {
  const size = asset.fileSize || 0;
  const durationSec = Math.round((asset.duration || 0) / 1000);
  if (durationSec && durationSec > MEDIA_LIMITS.videoMaxDurationSec) {
    Alert.alert('Видео слишком длинное', `Максимальная длительность — ${MEDIA_LIMITS.videoMaxDurationSec} секунд.`);
    return null;
  }
  if (size && size > MEDIA_LIMITS.videoMaxBytes) {
    Alert.alert('Видео слишком большое', `Максимальный размер — ${bytesLabel(MEDIA_LIMITS.videoMaxBytes)}.`);
    return null;
  }
  return { ...asset, type: 'video', durationSec };
}

function resizeAction(width = 0, height = 0, max = MEDIA_LIMITS.imageMaxDimension) {
  if (width <= max && height <= max) return null;
  return width >= height ? { resize: { width: max } } : { resize: { height: max } };
}
