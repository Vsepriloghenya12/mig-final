const crypto = require('crypto');
const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { clean } = require('../lib/utils');
const { publicUser } = require('../lib/shape');
const router = express.Router();

function normalizePhone(value = '') { return String(value).replace(/[^0-9]/g, ''); }
function normalizeHandle(value = '') {
  const requested = clean(value, '').replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '').slice(0, 28);
  return requested ? `@${requested}` : '';
}
function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
}
function setPassword(user, password) {
  const salt = crypto.randomBytes(16).toString('hex');
  user.passwordSalt = salt;
  user.passwordHash = hashPassword(password, salt);
}
function verifyPassword(user, password) {
  if (!user.passwordHash || !user.passwordSalt) return true;
  return user.passwordHash === hashPassword(password, user.passwordSalt);
}

router.post('/users', (req, res) => {
  const db = readDb();
  const mode = req.body.mode === 'register' ? 'register' : 'login';
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || '');
  const firstName = clean(req.body.firstName, '').trim();
  const lastName = clean(req.body.lastName, '').trim();
  const name = clean(req.body.name, `${firstName} ${lastName}`.trim()).trim();
  const handle = normalizeHandle(req.body.handle || req.body.nickname);
  let user = phone ? db.users.find((u) => normalizePhone(u.phone) === phone) : null;

  if (!phone || phone.length < 10) return res.status(400).json({ error: 'Введите номер телефона.' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'Введите пароль минимум 6 символов.' });

  if (mode === 'login') {
    if (!user) return res.status(404).json({ error: 'Аккаунт с этим номером не найден. Зарегистрируйтесь.' });
    if (!verifyPassword(user, password)) return res.status(401).json({ error: 'Неверный пароль.' });
    if (!user.passwordHash) setPassword(user, password);
  } else {
    if (user) return res.status(409).json({ error: 'Аккаунт с этим номером уже существует. Войдите.' });
    if (!firstName || firstName.length < 2) return res.status(400).json({ error: 'Введите имя.' });
    if (!lastName || lastName.length < 2) return res.status(400).json({ error: 'Введите фамилию.' });
    if (!handle) return res.status(400).json({ error: 'Введите никнейм.' });
    const handleTaken = db.users.find((u) => String(u.handle || '').toLowerCase() === handle.toLowerCase());
    if (handleTaken) return res.status(409).json({ error: 'Этот никнейм уже занят.' });
    user = getUser(db, clean(req.body.id, `phone_${phone}`));
    user.firstName = firstName;
    user.lastName = lastName;
    user.name = name || `${firstName} ${lastName}`.trim();
    user.handle = handle;
    setPassword(user, password);
  }

  user.phone = phone;
  user.status ||= 'active';
  user.lastLoginAt = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
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
