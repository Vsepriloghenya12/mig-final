const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { id, nowIso, clean } = require('../lib/utils');
const { shape } = require('../lib/shape');
const router = express.Router();

router.post('/posts', (req, res) => mutate(req, res, (db, user) => {
  const imageUrl = clean(req.body.imageUrl);
  const videoUrl = clean(req.body.videoUrl);
  const caption = clean(req.body.caption);
  if (!caption && !imageUrl && !videoUrl) throw new Error('Добавьте текст, фото или видео.');
  db.posts.push({
    id: id('post'),
    authorId: user.id,
    caption,
    linkUrl: clean(req.body.linkUrl),
    location: clean(req.body.location),
    imageUrl,
    videoUrl,
    mediaType: videoUrl ? 'video' : imageUrl ? 'photo' : 'text',
    likedBy: [],
    comments: [],
    createdAt: nowIso()
  });
}));
router.post('/stories', (req, res) => mutate(req, res, (db, user) => {
  const videoUrl = clean(req.body.videoUrl); const imageUrl = clean(req.body.imageUrl);
  if (!videoUrl && !imageUrl) throw new Error('Медиа обязательно.');
  db.stories.push({
    id: id('story'),
    authorId: user.id,
    caption: clean(req.body.caption),
    linkUrl: clean(req.body.linkUrl),
    location: clean(req.body.location),
    imageUrl,
    videoUrl,
    mediaType: videoUrl ? 'video' : 'photo',
    mood: clean(req.body.mood, 'default'),
    createdAt: nowIso()
  });
}));
router.post('/videos', (req, res) => mutate(req, res, (db, user) => {
  const videoUrl = clean(req.body.videoUrl || req.body.imageUrl);
  if (!videoUrl) throw new Error('Видео обязательно.');
  db.videos.push({
    id: id('video'),
    authorId: user.id,
    caption: clean(req.body.caption),
    linkUrl: clean(req.body.linkUrl),
    location: clean(req.body.location),
    videoUrl,
    mediaType: 'video',
    likedBy: [],
    comments: [],
    createdAt: nowIso()
  });
}));
router.post('/places', (req, res) => mutate(req, res, (db) => db.places.push({ id: id('place'), name: clean(req.body.name, 'Место'), address: clean(req.body.address), imageUrl: clean(req.body.imageUrl), latitude: req.body.latitude || null, longitude: req.body.longitude || null, checkins: 0, createdAt: nowIso() })));
function mutate(req, res, fn) { try { const db = readDb(); const user = getUser(db, req.body.userId); fn(db, user); writeDb(db); res.json(shape(db, user.id)); } catch (e) { res.status(400).json({ error: e.message }); } }
module.exports = router;
