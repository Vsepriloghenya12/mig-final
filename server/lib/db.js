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
  return {
    meta: { app: 'mig', version: 'v18', createdAt: nowIso(), updatedAt: nowIso() },
    users: [], posts: [], stories: [], videos: [], places: [], collections: [], dialogs: [], messages: [], games: []
  };
}
function ensure() { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.mkdirSync(UPLOAD_DIR, { recursive: true }); }
function normalize(db) {
  db.users ||= []; db.posts ||= []; db.stories ||= []; db.videos ||= []; db.places ||= [];
  db.collections ||= []; db.dialogs ||= []; db.messages ||= []; db.games ||= [];
  purgeLegacyDemo(db);
  db.users.forEach((u) => { u.followers ||= []; u.following ||= []; u.savedPostIds ||= []; });
  db.posts.forEach((p) => { p.likedBy ||= []; p.comments ||= []; delete p.imageKey; delete p.avatarKey; });
  db.videos.forEach((v) => { v.likedBy ||= []; v.comments ||= []; delete v.imageKey; });
  db.stories.forEach((s) => { delete s.imageKey; delete s.avatarKey; });
  db.places.forEach((p) => { p.checkins = Number(p.checkins || 0); delete p.imageKey; });
  db.meta ||= {}; db.meta.version = 'v18';
  return db;
}
function purgeLegacyDemo(db) {
  const demoUsers = new Set(db.users.filter(isDemoUser).map((u) => u.id));
  db.users = db.users.filter((u) => !demoUsers.has(u.id));
  db.posts = db.posts.filter((x) => !isDemoContent(x, demoUsers));
  db.stories = db.stories.filter((x) => !isDemoContent(x, demoUsers));
  db.videos = db.videos.filter((x) => !isDemoContent(x, demoUsers));
  db.places = db.places.filter((x) => !x.imageKey && !LEGACY_PLACE_NAMES.has(x.name));
  db.collections = db.collections.filter((x) => !x.imageKey && !demoUsers.has(x.userId));
  db.dialogs = db.dialogs.filter((d) => !(d.participantIds || []).some((id) => demoUsers.has(id)));
  const okDialogs = new Set(db.dialogs.map((d) => d.id));
  db.messages = db.messages.filter((m) => okDialogs.has(m.dialogId) && !demoUsers.has(m.userId));
  db.games = db.games.filter((g) => okDialogs.has(g.dialogId));
}
function isDemoUser(u) { return LEGACY_IDS.has(u.id) || LEGACY_HANDLES.has(u.handle) || !!u.avatarKey; }
function isDemoContent(x, demoUsers) { return !!x.imageKey || !!x.avatarKey || demoUsers.has(x.authorId) || demoUsers.has(x.userId); }
function readDb() { ensure(); if (!fs.existsSync(DB_PATH)) writeDb(seed()); return normalize(JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))); }
function writeDb(db) { ensure(); db.meta ||= {}; db.meta.updatedAt = nowIso(); fs.writeFileSync(DB_PATH, JSON.stringify(normalize(db), null, 2)); }
function resetDb() { const db = seed(); writeDb(db); return db; }
function getUser(db, userId = `user_${Date.now()}`) {
  let user = db.users.find((u) => u.id === userId);
  if (!user) { user = { id: userId, name: 'Пользователь', handle: `@${userId}`, bio: '', avatarUrl: '', followers: [], following: [], savedPostIds: [] }; db.users.push(user); }
  return user;
}
module.exports = { DATA_DIR, UPLOAD_DIR, readDb, writeDb, resetDb, getUser };
