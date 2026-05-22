const fs = require('fs');
const path = require('path');
const { nowIso } = require('./utils');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'db.json');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const LEGACY_IDS = new Set(['ivan', 'kristina', 'maxim', 'mari']);
const LEGACY_HANDLES = new Set(['@nastya.mig', '@kristina_li', '@maxim_levin']);
const LEGACY_PLACE_NAMES = new Set(['Surf Coffee', 'Хлебозавод', 'Двор НЭП', 'Набережная']);

function seed() {
  return { meta: { app: 'mig', version: 'v23', createdAt: nowIso(), updatedAt: nowIso() }, users: [], posts: [], stories: [], videos: [], places: [], collections: [], dialogs: [], messages: [], games: [], reports: [], moderationActions: [], notifications: [] };
}
function ensure() { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.mkdirSync(UPLOAD_DIR, { recursive: true }); }
function normalize(db) {
  Object.assign(db, { users: db.users || [], posts: db.posts || [], stories: db.stories || [], videos: db.videos || [], places: db.places || [], collections: db.collections || [], dialogs: db.dialogs || [], messages: db.messages || [], games: db.games || [], reports: db.reports || [], moderationActions: db.moderationActions || [], notifications: db.notifications || [] });
  purgeLegacyDemo(db);
  db.users.forEach((u) => { u.followers ||= []; u.following ||= []; u.savedPostIds ||= []; u.blockedUserIds ||= []; u.pushTokens ||= []; u.status ||= 'active'; });
  db.posts.forEach((p) => { p.likedBy ||= []; p.comments ||= []; p.status ||= 'active'; delete p.imageKey; delete p.avatarKey; });
  db.videos.forEach((v) => { v.likedBy ||= []; v.comments ||= []; v.status ||= 'active'; delete v.imageKey; });
  db.stories.forEach((s) => { s.status ||= 'active'; delete s.imageKey; delete s.avatarKey; });
  db.places.forEach((p) => { p.checkins = Number(p.checkins || 0); p.status ||= 'active'; delete p.imageKey; });
  db.reports.forEach((r) => { r.status ||= 'open'; });
  db.meta ||= {}; db.meta.version = 'v23';
  return db;
}
function purgeLegacyDemo(db) {
  const demoUsers = new Set(db.users.filter(isDemoUser).map((u) => u.id));
  db.users = db.users.filter((u) => !demoUsers.has(u.id));
  db.posts = db.posts.filter((x) => !isDemoContent(x, demoUsers)); db.stories = db.stories.filter((x) => !isDemoContent(x, demoUsers)); db.videos = db.videos.filter((x) => !isDemoContent(x, demoUsers));
  db.places = db.places.filter((x) => !x.imageKey && !LEGACY_PLACE_NAMES.has(x.name)); db.collections = db.collections.filter((x) => !x.imageKey && !demoUsers.has(x.userId));
  db.dialogs = db.dialogs.filter((d) => !(d.participantIds || []).some((id) => demoUsers.has(id)));
  const okDialogs = new Set(db.dialogs.map((d) => d.id));
  db.messages = db.messages.filter((m) => okDialogs.has(m.dialogId) && !demoUsers.has(m.userId)); db.games = db.games.filter((g) => okDialogs.has(g.dialogId));
}
function isDemoUser(u) { return LEGACY_IDS.has(u.id) || LEGACY_HANDLES.has(u.handle) || !!u.avatarKey; }
function isDemoContent(x, demoUsers) { return !!x.imageKey || !!x.avatarKey || demoUsers.has(x.authorId) || demoUsers.has(x.userId); }
function readDb() { ensure(); if (!fs.existsSync(DB_PATH)) writeDb(seed()); return normalize(JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))); }
function writeDb(db) { ensure(); db.meta ||= {}; db.meta.updatedAt = nowIso(); fs.writeFileSync(DB_PATH, JSON.stringify(normalize(db), null, 2)); }
function resetDb() { const db = seed(); writeDb(db); return db; }
function getUser(db, userId = `user_${Date.now()}`) {
  let user = db.users.find((u) => u.id === userId);
  if (!user) { user = { id: userId, name: 'Пользователь', handle: `@${userId}`, bio: '', avatarUrl: '', followers: [], following: [], savedPostIds: [], blockedUserIds: [], pushTokens: [], status: 'active' }; db.users.push(user); }
  return user;
}
module.exports = { DATA_DIR, UPLOAD_DIR, readDb, writeDb, resetDb, getUser };
