import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { MEDIA_LIMITS, bytesLabel } from '../config/mediaLimits';

async function ensurePermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Галерея недоступна', 'Разрешите доступ к фото и видео в настройках телефона.');
    return false;
  }
  return true;
}

export async function pickMedia(kind = 'image') {
  if (!(await ensurePermission())) return null;
  const mediaTypes = kind === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images;
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes, quality: 0.82, allowsEditing: false, videoMaxDuration: MEDIA_LIMITS.videoMaxDurationSec });
  if (result.canceled) return null;
  const asset = result.assets?.[0] || null;
  if (!asset) return null;
  return kind === 'video' ? validateVideo(asset) : compressImage(asset);
}

export async function pickAndUpload(api, kind = 'image') {
  const asset = await pickMedia(kind);
  if (!asset) return null;
  return api.upload(asset);
}

async function compressImage(asset) {
  if (asset.fileSize && asset.fileSize > MEDIA_LIMITS.imageMaxBytes * 2) {
    Alert.alert('Фото слишком большое', `Выберите фото до ${bytesLabel(MEDIA_LIMITS.imageMaxBytes * 2)}.`);
    return null;
  }
  const action = resizeAction(asset.width, asset.height);
  const out = await ImageManipulator.manipulateAsync(asset.uri, action ? [action] : [], { compress: MEDIA_LIMITS.imageCompress, format: ImageManipulator.SaveFormat.JPEG });
  return { ...asset, ...out, mimeType: 'image/jpeg', type: 'image', fileName: `mig-${Date.now()}.jpg` };
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

function resizeAction(width = 0, height = 0) {
  const max = MEDIA_LIMITS.imageMaxDimension;
  if (width <= max && height <= max) return null;
  return width >= height ? { resize: { width: max } } : { resize: { height: max } };
}
