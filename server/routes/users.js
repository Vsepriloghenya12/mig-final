const crypto = require('crypto');
const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { clean } = require('../lib/utils');
const { publicUser } = require('../lib/shape');
const router = express.Router();

function normalizePhone(value = '') { return String(value).replace(/[^0-9]/g, ''); }
function normalizeHandle(value = '') {
  const raw = clean(value, '').replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '').slice(0, 28);
  return raw ? `@${raw}` : '';
}
function passwordHash(password = '') {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

router.post('/users', (req, res) => {
  const db = readDb();
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || '');
  const mode = req.body.mode === 'register' ? 'register' : 'login';
  const firstName = clean(req.body.firstName, '');
  const lastName = clean(req.body.lastName, '');
  const requestedName = clean(req.body.name, `${firstName} ${lastName}`.trim());
  const handle = normalizeHandle(req.body.handle || req.body.nickname);
  let user = phone ? db.users.find((u) => normalizePhone(u.phone) === phone) : null;

  if (!phone) return res.status(400).json({ error: 'Введите номер телефона.' });
  if (password.length < 6) return res.status(400).json({ error: 'Введите пароль минимум из 6 символов.' });

  if (mode === 'login') {
    if (!user) return res.status(404).json({ error: 'Аккаунт с этим номером не найден. Зарегистрируйтесь.' });
    if (user.passwordHash && user.passwordHash !== passwordHash(password)) return res.status(401).json({ error: 'Неверный пароль.' });
    if (!user.passwordHash) user.passwordHash = passwordHash(password);
    user.lastLoginAt = new Date().toISOString();
    writeDb(db);
    return res.json({ user: publicUser(user) });
  }

  if (user) return res.status(409).json({ error: 'Аккаунт с этим номером уже есть. Войдите.' });
  if (firstName.length < 2) return res.status(400).json({ error: 'Введите имя.' });
  if (lastName.length < 2) return res.status(400).json({ error: 'Введите фамилию.' });
  if (!handle) return res.status(400).json({ error: 'Введите никнейм.' });
  const handleTaken = db.users.find((u) => String(u.handle || '').toLowerCase() === handle.toLowerCase());
  if (handleTaken) return res.status(409).json({ error: 'Этот никнейм уже занят.' });

  user = getUser(db, clean(req.body.id, `user_${Date.now()}`));
  user.name = requestedName || `${firstName} ${lastName}`.trim();
  user.firstName = firstName;
  user.lastName = lastName;
  user.phone = phone;
  user.handle = handle;
  user.passwordHash = passwordHash(password);
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
