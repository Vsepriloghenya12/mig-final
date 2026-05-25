const express = require('express');
const { readDb, writeDb, resetDb } = require('../lib/db');
const { deleteAccountData } = require('../lib/account');
const { clean, nowIso, id } = require('../lib/utils');
const router = express.Router();
const OWNER_TOKEN = process.env.OWNER_TOKEN || '';

function token(req) { return req.get('x-owner-token') || req.query.token || req.body?.token || ''; }
function guard(req, res, next) { return OWNER_TOKEN && token(req) === OWNER_TOKEN ? next() : res.status(401).json({ error: 'owner token is invalid' }); }
function action(db, type, targetId, reason) { db.moderationActions ||= []; db.moderationActions.push({ id: id('owner'), type, targetId, reason: clean(reason), createdAt: nowIso() }); }
function collection(type) { return ({ post: 'posts', posts: 'posts', story: 'stories', stories: 'stories', video: 'videos', videos: 'videos', place: 'places', places: 'places', message: 'messages', messages: 'messages', profile: 'users', user: 'users', users: 'users' })[type]; }
function findContent(db, type, contentId) { const coll = collection(type); return coll ? db[coll]?.find((x) => x.id === contentId) : null; }

router.get('/owner/data', guard, (req, res) => res.json(readDb()));

router.get('/owner/stats', guard, (req, res) => {
  const db = readDb();
  const dayMs = 24 * 60 * 60 * 1000;
  const since = (days) => Date.now() - days * dayMs;
  const time = (x) => Date.parse(x?.createdAt || x?.updatedAt || x?.lastLoginAt || 0) || 0;
  const allContent = [...(db.posts || []), ...(db.stories || []), ...(db.videos || []), ...(db.places || [])];
  const comments = [...(db.posts || []), ...(db.videos || [])].reduce((n, x) => n + (x.comments || []).length, 0);
  const likes = [...(db.posts || []), ...(db.videos || [])].reduce((n, x) => n + (x.likedBy || []).length, 0);
  res.json({
    users: db.users.length,
    activeUsers: db.users.filter((u) => u.status !== 'blocked').length,
    blockedUsers: db.users.filter((u) => u.status === 'blocked').length,
    usersToday: db.users.filter((u) => time(u) >= since(1)).length,
    users7d: db.users.filter((u) => time(u) >= since(7)).length,
    posts: db.posts.length,
    stories: db.stories.length,
    videos: db.videos.length,
    places: db.places.length,
    activeContent: allContent.filter((x) => x.status !== 'deleted').length,
    deletedContent: allContent.filter((x) => x.status === 'deleted').length,
    contentToday: allContent.filter((x) => time(x) >= since(1)).length,
    content7d: allContent.filter((x) => time(x) >= since(7)).length,
    dialogs: db.dialogs.length,
    messages: db.messages.length,
    messagesToday: db.messages.filter((x) => time(x) >= since(1)).length,
    games: db.games.length,
    reports: db.reports.length,
    openReports: db.reports.filter((r) => r.status === 'open').length,
    resolvedReports: db.reports.filter((r) => r.status === 'resolved').length,
    likes,
    comments,
    notifications: (db.notifications || []).length,
    moderationActions: (db.moderationActions || []).length,
  });
});

router.post('/owner/reset', guard, (req, res) => res.json(resetDb()));

router.post('/owner/users/:id/block', guard, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  user.status = req.body.block === false ? 'active' : 'blocked';
  user.statusReason = clean(req.body.reason);
  user.statusUpdatedAt = nowIso();
  action(db, user.status === 'blocked' ? 'owner_block_user' : 'owner_unblock_user', user.id, req.body.reason);
  writeDb(db);
  res.json({ ok: true, user });
});

router.post('/owner/users/:id/delete', guard, (req, res) => {
  const db = readDb();
  const result = deleteAccountData(db, req.params.id);
  if (!result.deleted) return res.status(404).json({ error: 'user not found' });
  action(db, 'owner_delete_account', req.params.id, req.body.reason);
  writeDb(db);
  res.json({ ok: true, ...result });
});

router.post('/owner/content/:type/:id/delete', guard, (req, res) => {
  const db = readDb();
  const item = findContent(db, req.params.type, req.params.id);
  if (!item) return res.status(404).json({ error: 'content not found' });
  item.status = 'deleted';
  item.deletedAt = nowIso();
  item.deleteReason = clean(req.body.reason, 'owner');
  action(db, 'owner_delete_content', `${req.params.type}:${req.params.id}`, req.body.reason);
  writeDb(db);
  res.json({ ok: true, item });
});

router.post('/owner/content/:type/:id/restore', guard, (req, res) => {
  const db = readDb();
  const item = findContent(db, req.params.type, req.params.id);
  if (!item) return res.status(404).json({ error: 'content not found' });
  item.status = 'active';
  delete item.deletedAt;
  delete item.deleteReason;
  action(db, 'owner_restore_content', `${req.params.type}:${req.params.id}`, req.body.reason);
  writeDb(db);
  res.json({ ok: true, item });
});

router.post('/owner/reports/:id/resolve', guard, (req, res) => {
  const db = readDb();
  const report = db.reports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'report not found' });
  report.status = 'resolved';
  report.resolution = clean(req.body.resolution, 'reviewed');
  report.resolvedAt = nowIso();
  action(db, 'owner_resolve_report', req.params.id, req.body.resolution);
  writeDb(db);
  res.json({ ok: true, report });
});

module.exports = router;
