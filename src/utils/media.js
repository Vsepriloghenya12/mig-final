import { assets } from '../assets';

export function mediaSource(item, fallback = 'lake') {
  if (!item) return assets[fallback] || assets.lake;
  if (typeof item === 'string' && /^https?:\/\//i.test(item)) return { uri: item };
  const url = String(item.mediaUrl || item.imageUrl || item.avatarUrl || item.videoUrl || '').trim();
  if (/^https?:\/\//i.test(url)) return { uri: url };
  return assets[item.imageKey] || assets[item.avatarKey] || assets[fallback] || assets.lake;
}

export function initials(name = 'М') {
  return String(name).trim().slice(0, 1).toUpperCase() || 'М';
}

export function safeText(value, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}
