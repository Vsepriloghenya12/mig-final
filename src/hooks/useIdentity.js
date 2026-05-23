import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const KEY = 'mig.identity.v1';

async function registerIdentity(identity) {
  const response = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(identity.authToken ? { 'x-user-token': identity.authToken } : {})
    },
    body: JSON.stringify(identity)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Не удалось создать профиль');
  return { id: data.session?.id || identity.id, name: data.session?.name || identity.name, handle: data.session?.handle, authToken: data.authToken || data.session?.authToken };
}

export function useIdentity() {
  const [identity, setIdentity] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const stored = JSON.parse(raw);
          const upgraded = await registerIdentity(stored);
          if (!cancelled) {
            await AsyncStorage.setItem(KEY, JSON.stringify(upgraded));
            setIdentity(upgraded);
          }
        }
      } catch (e) {
        console.log('Identity restore skipped:', e.message);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);
  const save = async (name) => {
    const draft = { id: `user_${Date.now().toString(36)}`, name: name.trim() || 'Пользователь' };
    const next = await registerIdentity(draft);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    setIdentity(next);
  };
  const clear = async () => { await AsyncStorage.removeItem(KEY); setIdentity(null); };
  return { identity, ready, save, clear };
}
