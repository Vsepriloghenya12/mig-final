import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false })
});

export function usePushNotifications(api, userId) {
  useEffect(() => {
    let cancelled = false;
    async function register() {
      if (!api || !userId) return;
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', { name: 'Близз', importance: Notifications.AndroidImportance.MAX });
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
    register();
    return () => { cancelled = true; };
  }, [api, userId]);
}
