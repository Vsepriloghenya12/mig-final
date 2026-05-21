const fs = require('fs');
const path = require('path');
const { nowIso } = require('./utils');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'db.json');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

function seed() {
  return {
    meta: { app: 'mig', version: 'v13', createdAt: nowIso(), updatedAt: nowIso() },
    users: [],
    posts: [], stories: [], videos: [], places: [], collections: [], dialogs: [], messages: [], games: []
  };
}
function ensure() { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.mkdirSync(UPLOAD_DIR, { recursive: true }); }
function normalize(db) {
  db.users ||= []; db.posts ||= []; db.stories ||= []; db.videos ||= []; db.places ||= [];
  db.collections ||= []; db.dialogs ||= []; db.messages ||= []; db.games ||= [];
  db.users.forEach((u) => { u.followers ||= []; u.following ||= []; u.savedPostIds ||= []; });
  db.posts.forEach((p) => { p.likedBy ||= []; p.comments ||= []; });
  db.videos.forEach((v) => { v.likedBy ||= []; v.comments ||= []; });
  db.places.forEach((p) => { p.checkins = Number(p.checkins || 0); });
  return db;
}
function readDb() { ensure(); if (!fs.existsSync(DB_PATH)) writeDb(seed()); return normalize(JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))); }
function writeDb(db) { ensure(); db.meta ||= {}; db.meta.updatedAt = nowIso(); fs.writeFileSync(DB_PATH, JSON.stringify(normalize(db), null, 2)); }
function resetDb() { const db = seed(); writeDb(db); return db; }
function getUser(db, userId = 'ivan') {
  let user = db.users.find((u) => u.id === userId);
  if (!user) { user = { id: userId, name: 'Пользователь', handle: `@${userId}`, bio: '', avatarUrl: '', followers: [], following: [], savedPostIds: [] }; db.users.push(user); }
  return user;
}
module.exports = { DATA_DIR, UPLOAD_DIR, readDb, writeDb, resetDb, getUser };
