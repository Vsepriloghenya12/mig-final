const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR } = require('./db');

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);
const IMAGE_MAX_BYTES = mb(process.env.MAX_IMAGE_MB || 8);
const VIDEO_MAX_BYTES = mb(process.env.MAX_VIDEO_MB || 80);
const VIDEO_MAX_SECONDS = Number(process.env.MAX_VIDEO_SECONDS || 60);

function mb(value) { return Number(value) * 1024 * 1024; }
function mediaKind(mimetype = '') {
  if (IMAGE_TYPES.has(mimetype)) return 'photo';
  if (VIDEO_TYPES.has(mimetype)) return 'video';
  return '';
}
function validateUploaded(file, body = {}) {
  const kind = mediaKind(file?.mimetype);
  if (!kind) return 'Недопустимый тип файла.';
  if (kind === 'photo' && file.size > IMAGE_MAX_BYTES) return `Фото больше ${process.env.MAX_IMAGE_MB || 8} МБ.`;
  if (kind === 'video' && file.size > VIDEO_MAX_BYTES) return `Видео больше ${process.env.MAX_VIDEO_MB || 80} МБ.`;
  if (kind === 'video' && Number(body.durationSec || 0) > VIDEO_MAX_SECONDS) return `Видео длиннее ${VIDEO_MAX_SECONDS} секунд.`;
  return '';
}
function publicUploadUrl(req, filename) {
  const base = process.env.PUBLIC_UPLOAD_BASE_URL || process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  return `${String(base).replace(/\/$/, '')}/uploads/${filename}`;
}
function removeUpload(file) {
  const name = path.basename(file?.filename || '');
  if (!name) return;
  try { fs.unlinkSync(path.join(UPLOAD_DIR, name)); } catch {}
}
module.exports = { IMAGE_TYPES, VIDEO_TYPES, IMAGE_MAX_BYTES, VIDEO_MAX_BYTES, VIDEO_MAX_SECONDS, mediaKind, validateUploaded, publicUploadUrl, removeUpload };
