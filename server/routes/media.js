const express = require('express');
const path = require('path');
const multer = require('multer');
const { UPLOAD_DIR } = require('../lib/db');
const { id } = require('../lib/utils');
const { mediaKind, publicUploadUrl, removeUpload, validateUploaded, VIDEO_MAX_BYTES } = require('../lib/mediaPolicy');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${id('media')}${safeExt(file)}`)
});
const upload = multer({ storage, limits: { fileSize: VIDEO_MAX_BYTES }, fileFilter: (req, file, cb) => cb(null, !!mediaKind(file.mimetype)) });

router.post('/media', (req, res) => upload.single('file')(req, res, (err) => {
  if (err) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Файл слишком большой.' : 'Не удалось загрузить файл.' });
  if (!req.file) return res.status(400).json({ error: 'file is required' });
  const error = validateUploaded(req.file, req.body);
  if (error) { removeUpload(req.file); return res.status(400).json({ error }); }
  const mediaType = mediaKind(req.file.mimetype);
  res.json({ ok: true, mediaType, url: publicUploadUrl(req, req.file.filename), sizeBytes: req.file.size, width: Number(req.body.width || 0), height: Number(req.body.height || 0), durationSec: Number(req.body.durationSec || 0), storage: process.env.STORAGE_DRIVER || 'local' });
}));
function safeExt(file) { return path.extname(file.originalname || '') || (file.mimetype.startsWith('video/') ? '.mp4' : '.jpg'); }
module.exports = router;
