import { useCallback, useEffect, useMemo, useState } from 'react';
import { createApi, loadBootstrap } from '../api/client';
import { API_URL } from '../config';

export function useMigData(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const api = useMemo(() => createApi(API_URL, userId), [userId]);
  const reload = useCallback(async () => {
    if (!userId) return;
    setLoading(true); setError('');
    try { setData(await loadBootstrap(api)); }
    catch (err) { setError(err.message || 'Ошибка загрузки'); }
    finally { setLoading(false); }
  }, [api, userId]);
  useEffect(() => { reload(); }, [reload]);
  return { api, data, setData, loading, error, reload };
}
