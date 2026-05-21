export function mediaUrl(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return String(item.mediaUrl || item.imageUrl || item.avatarUrl || item.videoUrl || '').trim();
}

export function mediaSource(item) {
  const url = mediaUrl(item);
  return /^https?:\/\//i.test(url) ? { uri: url } : null;
}

export function isVideoMedia(item) {
  const type = String(item?.mediaType || item?.type || '').toLowerCase();
  const url = mediaUrl(item).toLowerCase();
  return type === 'video' || /\.(mp4|mov|m4v|webm)(\?|$)/.test(url);
}

export function hasRealMedia(item) {
  return !!mediaSource(item);
}

export function initials(name = 'М') {
  return String(name).trim().slice(0, 1).toUpperCase() || 'М';
}

export function safeText(value, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}
