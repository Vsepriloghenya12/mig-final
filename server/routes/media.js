const express = require('express');
const path = require('path');
const multer = require('multer');
const { UPLOAD_DIR } = require('../lib/db');
const { id } = require('../lib/utils');
const router = express.Router();

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${id('media')}${safeExt(file)}`)
});
const upload = multer({ storage, limits: { fileSize: 90 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, allowed.has(file.mimetype)) });

router.post('/media', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file is required' });
  const base = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'photo';
  res.json({ ok: true, mediaType, url: `${base}/uploads/${req.file.filename}` });
});
function safeExt(file) { return path.extname(file.originalname || '') || (file.mimetype.startsWith('video/') ? '.mp4' : '.jpg'); }
module.exports = router;
