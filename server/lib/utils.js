function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function nowIso() { return new Date().toISOString(); }
function compact(n = 0) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n || 0);
}
function timeLabel(createdAt) {
  const diff = Date.now() - new Date(createdAt || Date.now()).getTime();
  const min = Math.max(1, Math.round(diff / 60000));
  if (min < 60) return `${min} мин`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.round(h / 24)} д`;
}
function clean(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}
module.exports = { id, nowIso, compact, timeLabel, clean };
