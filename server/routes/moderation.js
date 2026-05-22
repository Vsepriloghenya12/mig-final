const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { id, nowIso, clean } = require('../lib/utils');
const { shape } = require('../lib/shape');
const router = express.Router();
const OWNER_TOKEN = process.env.OWNER_TOKEN || '';

function token(req) { return req.get('x-owner-token') || req.query.token || req.body?.token || ''; }
function guard(req, res, next) { return OWNER_TOKEN && token(req) === OWNER_TOKEN ? next() : res.status(401).json({ error: 'owner token is invalid' }); }

router.post('/reports', (req, res) => {
  const db = readDb(); const reporter = getUser(db, req.body.userId);
  if (!req.body.targetType || !req.body.targetId) return res.status(400).json({ error: 'target is required' });
  const report = { id: id('report'), reporterId: reporter.id, targetType: clean(req.body.targetType), targetId: clean(req.body.targetId), targetUserId: clean(req.body.targetUserId), reason: clean(req.body.reason, 'Нарушение правил'), details: clean(req.body.details), status: 'open', createdAt: nowIso() };
  db.reports.push(report); writeDb(db); res.json({ ok: true, report });
});
router.post('/block-user', (req, res) => block(req, res, true));
router.post('/unblock-user', (req, res) => block(req, res, false));
router.get('/owner/reports', guard, (req, res) => res.json({ reports: readDb().reports || [] }));
router.post('/owner/reports/:id/resolve', guard, (req, res) => {
  const db = readDb(); const report = db.reports.find((r) => r.id === req.params.id); if (!report) return res.status(404).json({ error: 'report not found' });
  report.status = 'resolved'; report.resolution = clean(req.body.resolution, 'resolved'); report.resolvedAt = nowIso(); action(db, 'resolve_report', req.params.id, req.body.resolution); writeDb(db); res.json({ ok: true, report });
});
router.post('/owner/users/:id/block', guard, (req, res) => {
  const db = readDb(); const user = db.users.find((u) => u.id === req.params.id); if (!user) return res.status(404).json({ error: 'user not found' });
  user.status = req.body.block === false ? 'active' : 'blocked'; action(db, user.status === 'blocked' ? 'owner_block_user' : 'owner_unblock_user', user.id, req.body.reason); writeDb(db); res.json({ ok: true, user });
});
router.post('/owner/content/:type/:id/delete', guard, (req, res) => {
  const db = readDb(); const item = findContent(db, req.params.type, req.params.id); if (!item) return res.status(404).json({ error: 'content not found' });
  item.status = 'deleted'; item.deletedAt = nowIso(); item.deleteReason = clean(req.body.reason, 'moderation'); action(db, 'delete_content', `${req.params.type}:${req.params.id}`, req.body.reason); writeDb(db); res.json({ ok: true });
});
function block(req, res, shouldBlock) {
  const db = readDb(); if (!req.body.targetId) return res.status(400).json({ error: 'targetId is required' }); const user = getUser(db, req.body.userId); const target = getUser(db, req.body.targetId);
  if (user.id === target.id) return res.status(400).json({ error: 'Нельзя заблокировать себя' });
  user.blockedUserIds ||= []; const idx = user.blockedUserIds.indexOf(target.id);
  if (shouldBlock && idx < 0) user.blockedUserIds.push(target.id); if (!shouldBlock && idx >= 0) user.blockedUserIds.splice(idx, 1);
  writeDb(db); res.json(shape(db, user.id));
}
function findContent(db, type, id) { const map = { post: 'posts', video: 'videos', story: 'stories', place: 'places', message: 'messages', profile: 'users' }; return db[map[type]]?.find((x) => x.id === id); }
function action(db, type, targetId, reason) { db.moderationActions ||= []; db.moderationActions.push({ id: id('mod'), type, targetId, reason: clean(reason), createdAt: nowIso() }); }
module.exports = router;
