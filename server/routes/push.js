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

router.get('/notifications', (req, res) => {
  const db = readDb(); const user = getUser(db, req.query.userId);
  const after = Number(req.query.after || 0);
  const list = (db.notifications || [])
    .filter((item) => item.userId === user.id)
    .filter((item) => new Date(item.createdAt).getTime() > after)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-50);
  res.json({ notifications: list, serverTime: Date.now() });
});

module.exports = router;
