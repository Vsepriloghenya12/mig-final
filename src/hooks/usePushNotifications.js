import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false })
});

const lastKey = (userId) => `blizz.notifications.last.${userId}`;

export function usePushNotifications(api, userId) {
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let appStateSub;

    async function registerPush() {
      if (!api || !userId) return;
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Близз',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 180, 250],
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          });
        }
        const current = await Notifications.getPermissionsAsync();
        const finalStatus = current.status === 'granted' ? current.status : (await Notifications.requestPermissionsAsync()).status;
        if (finalStatus !== 'granted' || cancelled) return;
        const projectId = Constants.easConfig?.projectId || Constants.expoConfig?.extra?.eas?.projectId;
        const tokenResult = projectId ? await Notifications.getExpoPushTokenAsync({ projectId }) : await Notifications.getExpoPushTokenAsync();
        if (!cancelled && tokenResult?.data) await api.post('/api/push/register', { token: tokenResult.data, platform: Platform.OS });
      } catch (e) {
        console.log('Push registration skipped:', e.message);
      }
    }

    async function pollNotifications() {
      if (!api || !userId || cancelled) return;
      try {
        const stored = Number(await AsyncStorage.getItem(lastKey(userId)) || 0);
        const result = await api.get(`/api/notifications?after=${stored}`);
        const notifications = result?.notifications || [];
        if (!notifications.length) return;
        let newest = stored;
        for (const item of notifications) {
          const created = new Date(item.createdAt).getTime();
          if (created <= stored) continue;
          newest = Math.max(newest, created);
          await Notifications.scheduleNotificationAsync({
            content: {
              title: item.title || 'Близз',
              body: item.body || '',
              data: item.data || {},
              sound: 'default',
            },
            trigger: null,
          });
        }
        if (newest > stored) await AsyncStorage.setItem(lastKey(userId), String(newest));
      } catch (e) {
        console.log('Notification poll skipped:', e.message);
      }
    }

    registerPush();
    pollNotifications();
    timerRef.current = setInterval(pollNotifications, 15000);
    appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') pollNotifications();
    });

    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
      appStateSub?.remove?.();
    };
  }, [api, userId]);
}
