const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { clean } = require('../lib/utils');
const router = express.Router();

router.post('/push/register', (req, res) => {
  const db = readDb(); const user = getUser(db, req.body.userId);
  const token = clean(req.body.token);
  if (!/^ExponentPushToken\[|^ExpoPushToken\[/.test(token)) return res.status(400).json({ error: 'invalid push token' });
  user.pushTokens ||= [];
  if (!user.pushTokens.includes(token)) user.pushTokens.push(token);
  user.pushPlatform = clean(req.body.platform, user.pushPlatform || 'unknown');
  user.pushUpdatedAt = new Date().toISOString();
  writeDb(db); res.json({ ok: true });
});

router.post('/push/unregister', (req, res) => {
  const db = readDb(); const user = getUser(db, req.body.userId);
  const token = clean(req.body.token);
  user.pushTokens = (user.pushTokens || []).filter((t) => t !== token);
  writeDb(db); res.json({ ok: true });
});

module.exports = router;
