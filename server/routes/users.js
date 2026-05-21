const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { clean } = require('../lib/utils');
const { publicUser } = require('../lib/shape');
const router = express.Router();

router.post('/users', (req, res) => {
  const db = readDb();
  const user = getUser(db, clean(req.body.id, `user_${Date.now()}`));
  user.name = clean(req.body.name, user.name);
  user.handle = clean(req.body.handle, `@${user.id}`);
  writeDb(db);
  res.json({ user: publicUser(user) });
});
module.exports = router;
