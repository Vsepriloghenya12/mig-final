import { API_URL } from '../config';

export function mediaUrl(item) {
  if (!item) return '';
  if (typeof item === 'string') return normalizeUrl(item);
  return normalizeUrl(String(item.mediaUrl || item.imageUrl || item.avatarUrl || item.videoUrl || '').trim());
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

export function initials(name = 'Б') {
  return String(name).trim().slice(0, 1).toUpperCase() || 'Б';
}

export function safeText(value, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}

function normalizeUrl(value = '') {
  let url = String(value || '').trim();
  if (!url) return '';
  if (url.startsWith('/uploads/')) url = `${String(API_URL).replace(/\/$/, '')}${url}`;
  if (/^http:\/\//i.test(url) && !isLocalUrl(url)) url = url.replace(/^http:\/\//i, 'https://');
  return url;
}

function isLocalUrl(url = '') {
  return /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i.test(url);
}
