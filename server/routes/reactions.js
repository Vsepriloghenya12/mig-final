const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { id, nowIso, clean } = require('../lib/utils');
const { shape } = require('../lib/shape');
const router = express.Router();

router.post('/posts/:id/like', (req, res) => toggle(req, res, 'posts', 'likedBy'));
router.post('/videos/:id/like', (req, res) => toggle(req, res, 'videos', 'likedBy'));
router.post('/posts/:id/save', (req, res) => { const db = readDb(); const user = getUser(db, req.body.userId); flip(user.savedPostIds, req.params.id); writeDb(db); res.json(shape(db, user.id)); });
router.post('/posts/:id/comments', (req, res) => { const db = readDb(); const user = getUser(db, req.body.userId); const post = db.posts.find((p) => p.id === req.params.id); if (!post) return res.status(404).json({ error: 'post not found' }); post.comments.push({ id: id('comment'), userId: user.id, text: clean(req.body.text), createdAt: nowIso() }); writeDb(db); res.json(shape(db, user.id)); });
router.post('/places/:id/checkin', (req, res) => { const db = readDb(); const user = getUser(db, req.body.userId); const p = db.places.find((x) => x.id === req.params.id); if (p) p.checkins = Number(p.checkins || 0) + 1; writeDb(db); res.json(shape(db, user.id)); });
function toggle(req, res, coll, field) { const db = readDb(); const user = getUser(db, req.body.userId); const item = db[coll].find((x) => x.id === req.params.id); if (!item) return res.status(404).json({ error: 'not found' }); flip(item[field], user.id); writeDb(db); res.json(shape(db, user.id)); }
function flip(list, value) { const i = list.indexOf(value); if (i >= 0) list.splice(i, 1); else list.push(value); }
module.exports = router;
