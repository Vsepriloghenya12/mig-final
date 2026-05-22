import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const KEY = 'mig.identity.v1';

export function useIdentity() {
  const [identity, setIdentity] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { AsyncStorage.getItem(KEY).then((v) => { if (v) setIdentity(JSON.parse(v)); setReady(true); }); }, []);
  const save = async (name) => {
    const id = `user_${Date.now().toString(36)}`;
    const next = { id, name: name.trim() || 'Пользователь' };
    await fetch(`${API_URL}/api/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    setIdentity(next);
  };
  const clear = async () => { await AsyncStorage.removeItem(KEY); setIdentity(null); };
  return { identity, ready, save, clear }; 
}
