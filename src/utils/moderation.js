import { Alert } from 'react-native';
import { moderationApi } from '../api/moderation';

export function reportContent(api, target) {
  if (!target?.targetId) return Alert.alert('Жалоба', 'Не удалось определить объект жалобы.');
  Alert.alert('Пожаловаться', 'Отправить жалобу модератору?', [
    { text: 'Отмена', style: 'cancel' },
    { text: 'Отправить', style: 'destructive', onPress: async () => { try { await moderationApi.report(api, { reason: 'Нарушение правил', ...target }); Alert.alert('Готово', 'Жалоба отправлена.'); } catch (e) { Alert.alert('Ошибка', e.message); } } }
  ]);
}

export function blockUser(api, targetId, after) {
  if (!targetId) return Alert.alert('Блокировка', 'Не удалось определить пользователя.');
  Alert.alert('Заблокировать пользователя', 'Он не сможет писать вам, а его контент будет скрыт.', [
    { text: 'Отмена', style: 'cancel' },
    { text: 'Заблокировать', style: 'destructive', onPress: async () => { try { await moderationApi.blockUser(api, targetId); await after?.(); Alert.alert('Готово', 'Пользователь заблокирован.'); } catch (e) { Alert.alert('Ошибка', e.message); } } }
  ]);
}

export function showContentActions(api, target, after) {
  Alert.alert('Действия с публикацией', 'Выберите действие', [
    { text: 'Отмена', style: 'cancel' },
    { text: 'Пожаловаться', onPress: () => reportContent(api, target) },
    ...(target?.targetUserId ? [{ text: 'Заблокировать автора', style: 'destructive', onPress: () => blockUser(api, target.targetUserId, after) }] : [])
  ]);
}
