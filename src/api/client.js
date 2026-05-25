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
      const isVideo = asset.type === 'video';
      const name = asset.fileName || `blizz-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`;
      const type = asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg');
      form.append('file', { uri: asset.uri, name, type });
      form.append('userId', userId || '');
      form.append('mediaType', isVideo ? 'video' : 'photo');
      form.append('durationSec', String(asset.durationSec || Math.round((asset.duration || 0) / 1000) || 0));
      form.append('width', String(asset.width || 0));
      form.append('height', String(asset.height || 0));
      const response = await fetch(`${root}/api/media`, { method: 'POST', body: form });
      return parse(response);
    }
  };
}

export async function loadBootstrap(api) {
  return api.get('/api/bootstrap');
}
