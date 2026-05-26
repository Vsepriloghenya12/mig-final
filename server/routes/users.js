const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { clean } = require('../lib/utils');
const { publicUser } = require('../lib/shape');
const router = express.Router();

function normalizePhone(value = '') { return String(value).replace(/[^0-9]/g, ''); }

router.post('/users', (req, res) => {
  const db = readDb();
  const phone = normalizePhone(req.body.phone);
  const mode = req.body.mode === 'register' ? 'register' : 'login';
  let user = phone ? db.users.find((u) => normalizePhone(u.phone) === phone) : null;

  if (mode === 'login' && !user) return res.status(404).json({ error: 'Аккаунт с этим номером не найден. Зарегистрируйтесь.' });

  const requestedHandle = clean(req.body.handle, '').replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '').slice(0, 28);
  const handle = requestedHandle ? `@${requestedHandle}` : '';
  if (mode === 'register') {
    if (!phone) return res.status(400).json({ error: 'Введите номер телефона.' });
    if (!clean(req.body.name, '')) return res.status(400).json({ error: 'Введите имя.' });
    if (!handle) return res.status(400).json({ error: 'Введите никнейм.' });
    const handleTaken = db.users.find((u) => String(u.handle || '').toLowerCase() === handle.toLowerCase() && (!user || u.id !== user.id));
    if (handleTaken) return res.status(409).json({ error: 'Этот никнейм уже занят.' });
  }

  if (!user) user = getUser(db, clean(req.body.id, `user_${Date.now()}`));
  if (mode === 'register' || req.body.name) user.name = clean(req.body.name, user.name || 'Пользователь');
  user.phone = phone || user.phone || '';
  if (handle) user.handle = handle;
  user.status ||= 'active';
  user.lastLoginAt = new Date().toISOString();
  writeDb(db);
  res.json({ user: publicUser(user) });
});


router.get('/users/:id/connections', (req, res) => {
  const db = readDb();
  const viewer = getUser(db, req.query.userId);
  const target = db.users.find((u) => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Пользователь не найден' });
  const type = req.query.type === 'following' ? 'following' : 'followers';
  const ids = Array.isArray(target[type]) ? target[type] : [];
  const hidden = new Set([...(viewer.blockedUserIds || [])]);
  const users = ids
    .map((id) => db.users.find((u) => u.id === id))
    .filter((u) => u && u.status !== 'blocked' && !hidden.has(u.id))
    .map((u) => publicUser(u, viewer));
  res.json({ type, users });
});

module.exports = router;
