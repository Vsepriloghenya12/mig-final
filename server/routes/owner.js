const express = require('express');
const fs = require('fs');
const path = require('path');
const { readDb, writeDb, resetDb, UPLOAD_DIR } = require('../lib/db');
const { deleteAccountData } = require('../lib/account');
const { clean, nowIso, id } = require('../lib/utils');
const router = express.Router();
const OWNER_TOKEN = process.env.OWNER_TOKEN || '';

function token(req) { return req.get('x-owner-token') || req.query.token || req.body?.token || ''; }
function guard(req, res, next) { return OWNER_TOKEN && token(req) === OWNER_TOKEN ? next() : res.status(401).json({ error: 'owner token is invalid' }); }
function action(db, type, targetId, reason) { db.moderationActions ||= []; db.moderationActions.push({ id: id('owner'), type, targetId, reason: clean(reason), createdAt: nowIso() }); }
function collection(type) { return ({ post: 'posts', posts: 'posts', story: 'stories', stories: 'stories', blizz: 'stories', blizzes: 'stories', video: 'videos', videos: 'videos', place: 'places', places: 'places', message: 'messages', messages: 'messages', profile: 'users', user: 'users', users: 'users' })[type]; }
function findContent(db, type, contentId) { const coll = collection(type); return coll ? db[coll]?.find((x) => x.id === contentId) : null; }
function n(value) { return Number(value || 0); }
function when(x) { return Date.parse(x?.createdAt || x?.sentAt || x?.updatedAt || x?.lastLoginAt || 0) || 0; }
function dayKey(msOrDate) { const d = new Date(msOrDate); return d.toISOString().slice(0, 10); }
function lastDays(days) {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, index) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (days - 1 - index));
    return dayKey(d);
  });
}
function inLast(x, days) { return when(x) >= Date.now() - days * 24 * 60 * 60 * 1000; }
function countOn(list, key) { return list.filter((x) => dayKey(when(x)) === key).length; }
function percent(a, b) { return b ? Math.round((a / b) * 1000) / 10 : 0; }
function fileStats(dir) {
  let files = 0;
  let bytes = 0;
  function walk(p) {
    if (!fs.existsSync(p)) return;
    for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
      const full = path.join(p, entry.name);
      if (entry.isDirectory()) walk(full);
      else {
        files += 1;
        bytes += fs.statSync(full).size || 0;
      }
    }
  }
  walk(dir);
  return { files, bytes, megabytes: Math.round((bytes / 1024 / 1024) * 10) / 10 };
}
function authorId(x) { return x.authorId || x.userId || x.ownerId || ''; }
function active(x) { return x.status !== 'deleted'; }
function contentItem(type, item) { return { ...item, type, authorId: authorId(item), createdAt: item.createdAt || item.updatedAt || '' }; }
function buildStats(db) {
  const users = db.users || [];
  const posts = db.posts || [];
  const stories = db.stories || [];
  const videos = db.videos || [];
  const places = db.places || [];
  const dialogs = db.dialogs || [];
  const messages = db.messages || [];
  const reports = db.reports || [];
  const notifications = db.notifications || [];
  const moderationActions = db.moderationActions || [];
  const content = [
    ...posts.map((x) => contentItem('post', x)),
    ...stories.map((x) => contentItem('blizz', x)),
    ...videos.map((x) => contentItem('video', x)),
    ...places.map((x) => contentItem('place', x)),
  ];
  const activeUsers = users.filter((u) => u.status !== 'blocked');
  const blockedUsers = users.filter((u) => u.status === 'blocked');
  const activeContent = content.filter(active);
  const deletedContent = content.filter((x) => x.status === 'deleted');
  const likes = [...posts, ...videos].reduce((sum, x) => sum + (x.likedBy || []).length, 0);
  const comments = [...posts, ...videos].reduce((sum, x) => sum + (x.comments || []).length, 0);
  const saves = users.reduce((sum, x) => sum + (x.savedPostIds || []).length, 0);
  const follows = users.reduce((sum, x) => sum + (x.following || []).length, 0);
  const pushTokens = users.reduce((sum, x) => sum + (x.pushTokens || []).length, 0);
  const openReports = reports.filter((r) => r.status !== 'resolved');
  const resolvedReports = reports.filter((r) => r.status === 'resolved');
  const media = fileStats(UPLOAD_DIR);
  const days = lastDays(14);
  const series = days.map((day) => ({
    day: day.slice(5),
    iso: day,
    users: countOn(users, day),
    content: countOn(content, day),
    posts: countOn(posts, day),
    blizzes: countOn(stories, day),
    videos: countOn(videos, day),
    places: countOn(places, day),
    messages: countOn(messages, day),
    reports: countOn(reports, day),
  }));
  const typeRows = [
    { type: 'Посты', key: 'posts', total: posts.length, active: posts.filter(active).length, deleted: posts.filter((x) => x.status === 'deleted').length },
    { type: 'Близзы', key: 'blizzes', total: stories.length, active: stories.filter(active).length, deleted: stories.filter((x) => x.status === 'deleted').length },
    { type: 'Видео', key: 'videos', total: videos.length, active: videos.filter(active).length, deleted: videos.filter((x) => x.status === 'deleted').length },
    { type: 'Места', key: 'places', total: places.length, active: places.filter(active).length, deleted: places.filter((x) => x.status === 'deleted').length },
  ];
  const userMap = new Map(users.map((u) => [u.id, u]));
  const topCreators = users.map((u) => {
    const authored = content.filter((x) => authorId(x) === u.id);
    const userLikes = [...posts, ...videos].filter((x) => authorId(x) === u.id).reduce((sum, x) => sum + (x.likedBy || []).length, 0);
    const userComments = [...posts, ...videos].filter((x) => authorId(x) === u.id).reduce((sum, x) => sum + (x.comments || []).length, 0);
    return {
      id: u.id,
      name: u.name || u.handle || u.phone || u.id,
      handle: u.handle || '',
      status: u.status || 'active',
      content: authored.length,
      followers: (u.followers || []).length,
      following: (u.following || []).length,
      likes: userLikes,
      comments: userComments,
      score: authored.length * 3 + userLikes + userComments,
    };
  }).sort((a, b) => b.score - a.score).slice(0, 10);
  const recentUsers = [...users].sort((a, b) => when(b) - when(a)).slice(0, 12).map((u) => ({ id: u.id, name: u.name, handle: u.handle, phone: u.phone, status: u.status, createdAt: u.createdAt || u.lastLoginAt || u.updatedAt }));
  const recentContent = [...content].sort((a, b) => when(b) - when(a)).slice(0, 16).map((x) => ({ id: x.id, type: x.type, authorId: authorId(x), authorName: userMap.get(authorId(x))?.name || authorId(x), status: x.status || 'active', caption: x.caption || x.text || x.name || '', createdAt: x.createdAt || x.updatedAt }));
  const recentReports = [...reports].sort((a, b) => when(b) - when(a)).slice(0, 16);
  return {
    totals: {
      users: users.length,
      activeUsers: activeUsers.length,
      blockedUsers: blockedUsers.length,
      usersToday: users.filter((u) => inLast(u, 1)).length,
      users7d: users.filter((u) => inLast(u, 7)).length,
      posts: posts.length,
      blizzes: stories.length,
      videos: videos.length,
      places: places.length,
      content: content.length,
      activeContent: activeContent.length,
      deletedContent: deletedContent.length,
      contentToday: content.filter((x) => inLast(x, 1)).length,
      content7d: content.filter((x) => inLast(x, 7)).length,
      dialogs: dialogs.length,
      messages: messages.length,
      messagesToday: messages.filter((x) => inLast(x, 1)).length,
      messages7d: messages.filter((x) => inLast(x, 7)).length,
      reports: reports.length,
      openReports: openReports.length,
      resolvedReports: resolvedReports.length,
      likes,
      comments,
      saves,
      follows,
      pushTokens,
      notifications: notifications.length,
      moderationActions: moderationActions.length,
      games: (db.games || []).length,
      mediaFiles: media.files,
      mediaMb: media.megabytes,
    },
    rates: {
      activeUserRate: percent(activeUsers.length, users.length),
      blockedUserRate: percent(blockedUsers.length, users.length),
      contentDeletionRate: percent(deletedContent.length, content.length),
      reportResolutionRate: percent(resolvedReports.length, reports.length),
      pushCoverage: percent(users.filter((u) => (u.pushTokens || []).length).length, users.length),
      engagementPerContent: content.length ? Math.round(((likes + comments + saves) / content.length) * 10) / 10 : 0,
      messagesPerDialog: dialogs.length ? Math.round((messages.length / dialogs.length) * 10) / 10 : 0,
    },
    series,
    contentTypes: typeRows,
    status: [
      { name: 'Активный контент', value: activeContent.length },
      { name: 'Удалённый контент', value: deletedContent.length },
    ],
    moderation: [
      { name: 'Открытые жалобы', value: openReports.length },
      { name: 'Закрытые жалобы', value: resolvedReports.length },
      { name: 'Действия модерации', value: moderationActions.length },
    ],
    topCreators,
    recent: { users: recentUsers, content: recentContent, reports: recentReports },
    generatedAt: nowIso(),
  };
}

router.get('/owner/data', guard, (req, res) => res.json(readDb()));
router.get('/owner/stats', guard, (req, res) => res.json(buildStats(readDb())));
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
