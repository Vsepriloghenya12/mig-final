const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { clean } = require('../lib/utils');
const { shape } = require('../lib/shape');
const router = express.Router();

router.post('/profile', (req, res) => {
  const db = readDb(); const user = getUser(db, req.body.userId);
  user.name = clean(req.body.name, user.name); user.bio = clean(req.body.bio, user.bio);
  user.avatarUrl = clean(req.body.avatarUrl, user.avatarUrl); writeDb(db); res.json(shape(db, user.id));
});
router.post('/follow', (req, res) => {
  const db = readDb(); const user = getUser(db, req.body.userId); const target = getUser(db, req.body.targetId);
  flip(user.following, target.id); flip(target.followers, user.id); writeDb(db); res.json(shape(db, user.id));
});
function flip(list, value) { const i = list.indexOf(value); if (i >= 0) list.splice(i, 1); else list.push(value); }
module.exports = router;
