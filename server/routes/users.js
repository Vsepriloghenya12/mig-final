const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { clean } = require('../lib/utils');
const { publicUser } = require('../lib/shape');
const router = express.Router();

function normalizePhone(value = '') { return String(value).replace(/[^0-9]/g, ''); }

router.post('/users', (req, res) => {
  const db = readDb();
  const phone = normalizePhone(req.body.phone);
  let user = phone ? db.users.find((u) => normalizePhone(u.phone) === phone) : null;
  if (!user) user = getUser(db, clean(req.body.id, `user_${Date.now()}`));
  user.name = clean(req.body.name, user.name);
  user.phone = phone || user.phone || '';
  user.handle = clean(req.body.handle, user.handle || `@${user.id}`);
  user.status ||= 'active';
  user.lastLoginAt = new Date().toISOString();
  writeDb(db);
  res.json({ user: publicUser(user) });
});
module.exports = router;
