import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const KEY = 'mig.identity.v1';
const LEGACY_KEYS = ['mig.user', 'mig.user.v1', 'mig.auth', 'mig.session'];

function normalizePhone(value = '') {
  return String(value).replace(/[^0-9]/g, '');
}

function phoneHash(phone) {
  let hash = 5381;
  for (let i = 0; i < phone.length; i += 1) hash = ((hash << 5) + hash) ^ phone.charCodeAt(i);
  return Math.abs(hash >>> 0).toString(36);
}

function cleanHandle(value = '') {
  const raw = String(value || '')
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-zA-Z0-9._]/g, '')
    .slice(0, 28);
  return raw ? `@${raw}` : '';
}

function buildIdentity(payload = {}) {
  const phoneDigits = normalizePhone(payload.phone);
  const mode = payload.mode === 'register' ? 'register' : 'login';
  const firstName = String(payload.firstName || '').trim();
  const lastName = String(payload.lastName || '').trim();
  const fallbackName = String(payload.name || '').trim();
  const name = mode === 'register' ? `${firstName} ${lastName}`.trim() : fallbackName;
  const handle = cleanHandle(payload.handle || payload.nickname);
  return {
    id: phoneDigits ? `phone_${phoneHash(phoneDigits)}` : `user_${Date.now().toString(36)}`,
    mode,
    phone: phoneDigits,
    password: String(payload.password || ''),
    firstName,
    lastName,
    name,
    handle,
  };
}

export function useIdentity() {
  const [identity, setIdentity] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (!mounted) return;
        if (v) {
          try { setIdentity(JSON.parse(v)); }
          catch { AsyncStorage.removeItem(KEY); }
        }
      })
      .finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);

  const save = async (payload) => {
    const next = buildIdentity(payload || {});
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || 'Не удалось войти');
    const saved = data?.user ? { ...next, ...data.user, password: undefined, mode: undefined } : { ...next, password: undefined, mode: undefined };
    await AsyncStorage.multiSet([[KEY, JSON.stringify(saved)]]);
    setIdentity(saved);
  };

  const clear = async () => {
    await AsyncStorage.multiRemove([KEY, ...LEGACY_KEYS]);
    setIdentity(null);
  };

  return { identity, ready, save, clear };
}
