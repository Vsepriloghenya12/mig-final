const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { clean } = require('../lib/utils');
const { publicUser } = require('../lib/shape');
const { ensureSession, sessionPayload, tokenFromRequest } = require('../lib/auth');
const router = express.Router();

router.post('/users', (req, res) => {
  const db = readDb();
  const user = getUser(db, clean(req.body.id, `user_${Date.now()}`));
  const suppliedToken = tokenFromRequest(req);
  if (user.sessionToken && suppliedToken && suppliedToken !== user.sessionToken) return res.status(401).json({ error: 'Сессия недействительна' });
  user.name = clean(req.body.name, user.name);
  user.handle = clean(req.body.handle, user.handle || `@${user.id}`);
  ensureSession(user);
  writeDb(db);
  res.json({ user: publicUser(user), session: sessionPayload(user), authToken: user.sessionToken });
});
module.exports = router;
