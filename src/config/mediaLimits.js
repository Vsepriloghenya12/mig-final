export const MEDIA_LIMITS = {
  imageMaxBytes: 8 * 1024 * 1024,
  videoMaxBytes: 80 * 1024 * 1024,
  videoMaxDurationSec: 60,
  imageMaxDimension: 1600,
  imageCompress: 0.78
};

export function bytesLabel(bytes) {
  return `${Math.round(bytes / 1024 / 1024)} МБ`;
}
