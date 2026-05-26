const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { deleteAccountData } = require('../lib/account');
const { clean } = require('../lib/utils');
const { shape } = require('../lib/shape');
const { notifyUser } = require('../lib/push');
const router = express.Router();

function normalizeHandle(value, fallback) {
  const raw = clean(value, fallback || '').replace(/^@+/, '').replace(/[^a-zA-Z0-9_.]/g, '').slice(0, 24);
  return raw ? `@${raw}` : fallback;
}

router.post('/profile', (req, res) => {
  const db = readDb(); const user = getUser(db, req.body.userId);
  const nextHandle = normalizeHandle(req.body.handle, user.handle || `@${user.id}`);
  if (nextHandle && db.users.some((u) => u.id !== user.id && String(u.handle || '').toLowerCase() === nextHandle.toLowerCase())) {
    return res.status(409).json({ error: 'Этот никнейм уже занят' });
  }
  user.name = clean(req.body.name, user.name); user.handle = nextHandle; user.bio = clean(req.body.bio, user.bio); user.avatarUrl = clean(req.body.avatarUrl, user.avatarUrl);
  writeDb(db); res.json(shape(db, user.id));
});

router.post('/account/delete', (req, res) => {
  const db = readDb(); const user = getUser(db, req.body.userId); const result = deleteAccountData(db, user.id);
  writeDb(db); res.json({ ok: true, ...result });
});

router.post('/follow', (req, res) => {
  const db = readDb(); const user = getUser(db, req.body.userId); const target = getUser(db, req.body.targetId);
  if (blocked(user, target)) return res.status(403).json({ error: 'Пользователь заблокирован' });
  const added = flip(user.following, target.id); flip(target.followers, user.id, added);
  if (added) notifyUser(db, target.id, { title: 'Новый подписчик', body: `${user.name || 'Пользователь'} подписался на вас`, data: { type: 'follow', userId: user.id } });
  writeDb(db); res.json(shape(db, user.id));
});
function blocked(a, b) { return a.status === 'blocked' || b.status === 'blocked' || a.blockedUserIds?.includes(b.id) || b.blockedUserIds?.includes(a.id); }
function flip(list, value, forceAdd) { const i = list.indexOf(value); if (forceAdd === true) { if (i < 0) list.push(value); return true; } if (forceAdd === false) { if (i >= 0) list.splice(i, 1); return false; } if (i >= 0) { list.splice(i, 1); return false; } list.push(value); return true; }
module.exports = router;
