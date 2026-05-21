import { API_URL } from '../config';

const jsonHeaders = { Accept: 'application/json', 'Content-Type': 'application/json' };

async function parse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
  return data;
}

export function createApi(baseUrl = API_URL, userId) {
  const root = String(baseUrl).replace(/\/$/, '');
  const addUser = (path) => `${root}${path}${path.includes('?') ? '&' : '?'}userId=${encodeURIComponent(userId)}`;
  return {
    root, userId,
    get: (path) => fetch(addUser(path)).then(parse),
    post: (path, body = {}) => fetch(`${root}${path}`, {
      method: 'POST', headers: jsonHeaders, body: JSON.stringify({ userId, ...body })
    }).then(parse),
    upload: async (asset) => {
      const form = new FormData();
      const name = asset.fileName || `mig-${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`;
      form.append('file', { uri: asset.uri, name, type: asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg') });
      const response = await fetch(`${root}/api/media`, { method: 'POST', body: form });
      return parse(response);
    }
  };
}

export async function loadBootstrap(api) {
  return api.get('/api/bootstrap');
}
