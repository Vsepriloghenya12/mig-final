const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { id, nowIso, clean } = require('../lib/utils');
const { shape } = require('../lib/shape');
const { notifyUser } = require('../lib/push');
const router = express.Router();

router.post('/posts/:id/like', (req, res) => toggle(req, res, 'posts', 'likedBy'));
router.post('/videos/:id/like', (req, res) => toggle(req, res, 'videos', 'likedBy'));
router.post('/posts/:id/save', (req, res) => { const db = readDb(); const user = getUser(db, req.body.userId); if (user.status === 'blocked') return res.status(403).json({ error: 'Аккаунт заблокирован' }); flip(user.savedPostIds, req.params.id); writeDb(db); res.json(shape(db, user.id)); });
router.post('/posts/:id/comments', (req, res) => comment(req, res, 'posts'));
router.post('/videos/:id/comments', (req, res) => comment(req, res, 'videos'));
router.post('/places/:id/checkin', (req, res) => { const db = readDb(); const user = getUser(db, req.body.userId); if (user.status === 'blocked') return res.status(403).json({ error: 'Аккаунт заблокирован' }); const p = db.places.find((x) => x.id === req.params.id); if (p) p.checkins = Number(p.checkins || 0) + 1; writeDb(db); res.json(shape(db, user.id)); });
function comment(req, res, coll) { const db = readDb(); const user = getUser(db, req.body.userId); if (user.status === 'blocked') return res.status(403).json({ error: 'Аккаунт заблокирован' }); const item = db[coll].find((p) => p.id === req.params.id); if (!item) return res.status(404).json({ error: 'not found' }); item.comments ||= []; item.comments.push({ id: id('comment'), userId: user.id, text: clean(req.body.text), createdAt: nowIso() }); if (item.authorId && item.authorId !== user.id) notifyUser(db, item.authorId, { title: 'Новый комментарий', body: `${user.name || 'Пользователь'}: ${clean(req.body.text)}`, data: { type: 'comment', contentType: coll, contentId: item.id } }); writeDb(db); res.json(shape(db, user.id)); }
function toggle(req, res, coll, field) { const db = readDb(); const user = getUser(db, req.body.userId); if (user.status === 'blocked') return res.status(403).json({ error: 'Аккаунт заблокирован' }); const item = db[coll].find((x) => x.id === req.params.id); if (!item) return res.status(404).json({ error: 'not found' }); const added = flip(item[field], user.id); if (added && item.authorId && item.authorId !== user.id) notifyUser(db, item.authorId, { title: 'Новая отметка', body: `${user.name || 'Пользователь'} отметил ваш Миг`, data: { type: 'like', contentType: coll, contentId: item.id } }); writeDb(db); res.json(shape(db, user.id)); }
function flip(list, value) { const i = list.indexOf(value); if (i >= 0) { list.splice(i, 1); return false; } list.push(value); return true; }
module.exports = router;
