import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

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
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes, quality: 0.88, allowsEditing: false });
  if (result.canceled) return null;
  return result.assets?.[0] || null;
}

export async function pickAndUpload(api, kind = 'image') {
  const asset = await pickMedia(kind);
  if (!asset) return null;
  return api.upload(asset);
}
