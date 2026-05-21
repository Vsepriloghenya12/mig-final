const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { id, nowIso, clean } = require('../lib/utils');
const { shape } = require('../lib/shape');
const router = express.Router();

router.post('/posts', (req, res) => mutate(req, res, (db, user) => db.posts.push({ id: id('post'), authorId: user.id, caption: clean(req.body.caption), location: clean(req.body.location), imageUrl: clean(req.body.imageUrl), likedBy: [], comments: [], createdAt: nowIso() })));
router.post('/stories', (req, res) => mutate(req, res, (db, user) => db.stories.push({ id: id('story'), authorId: user.id, caption: clean(req.body.caption), location: clean(req.body.location), imageUrl: clean(req.body.imageUrl), mood: clean(req.body.mood, 'default'), createdAt: nowIso() })));
router.post('/videos', (req, res) => mutate(req, res, (db, user) => db.videos.push({ id: id('video'), authorId: user.id, caption: clean(req.body.caption), location: clean(req.body.location), imageUrl: clean(req.body.videoUrl || req.body.imageUrl), likedBy: [], comments: [], createdAt: nowIso() })));
router.post('/places', (req, res) => mutate(req, res, (db) => db.places.push({ id: id('place'), name: clean(req.body.name, 'Место'), address: clean(req.body.address), imageUrl: clean(req.body.imageUrl), checkins: 0, createdAt: nowIso() })));
router.post('/collections', (req, res) => mutate(req, res, (db, user) => db.collections.push({ id: id('collection'), userId: user.id, title: clean(req.body.title, 'Подборка'), description: clean(req.body.description), postIds: [], createdAt: nowIso() })));
function mutate(req, res, fn) { const db = readDb(); const user = getUser(db, req.body.userId); fn(db, user); writeDb(db); res.json(shape(db, user.id)); }
module.exports = router;
