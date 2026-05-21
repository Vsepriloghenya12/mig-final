const express = require('express');
const path = require('path');
const multer = require('multer');
const { UPLOAD_DIR } = require('../lib/db');
const { id } = require('../lib/utils');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${id('media')}${path.extname(file.originalname || '.jpg')}`)
});
const upload = multer({ storage, limits: { fileSize: 80 * 1024 * 1024 } });

router.post('/media', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file is required' });
  const base = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'photo';
  res.json({ ok: true, mediaType, url: `${base}/uploads/${req.file.filename}` });
});
module.exports = router;
