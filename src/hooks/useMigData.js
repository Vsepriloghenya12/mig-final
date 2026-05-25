import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { createApi, loadBootstrap } from '../api/client';
import { API_URL } from '../config';

export function useMigData(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const appState = useRef(AppState.currentState);
  const mounted = useRef(true);
  const api = useMemo(() => createApi(API_URL, userId), [userId]);

  const reload = useCallback(async ({ silent = false } = {}) => {
    if (!userId || appState.current !== 'active') return;
    if (!silent) setLoading(true);
    setError('');
    try {
      const nextData = await loadBootstrap(api);
      if (mounted.current) setData(nextData);
    }
    catch (err) {
      if (mounted.current) setError(err.message || 'Ошибка загрузки');
    }
    finally {
      if (mounted.current && !silent) setLoading(false);
    }
  }, [api, userId]);

  useEffect(() => {
    mounted.current = true;
    if (!userId) {
      setData(null);
      setLoading(false);
      setError('');
      return () => { mounted.current = false; };
    }
    reload();
    return () => { mounted.current = false; };
  }, [reload, userId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasInactive = appState.current !== 'active';
      appState.current = nextState;
      if (wasInactive && nextState === 'active') reload({ silent: true });
    });
    return () => subscription.remove();
  }, [reload]);

  return { api, data, setData, loading, error, reload };
}
