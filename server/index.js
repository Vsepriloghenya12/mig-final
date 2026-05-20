const express = require('express');
const cors = require('cors');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = Number(process.env.PORT || 4000);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'db.json');
const OWNER_TOKEN = process.env.OWNER_TOKEN || 'mig-owner-demo';
const PUBLIC_URL = process.env.PUBLIC_URL || '';
const NODE_ENV = process.env.NODE_ENV || 'development';

function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function seed() {
  return {
    meta: {
      createdAt: nowIso(),
      updatedAt: nowIso(),
      app: 'mig',
      version: 'real-v12'
    },
    users: [
      { id: 'ivan', name: 'Ваш профиль', handle: '@mig.user', avatarKey: 'avatar', avatarUrl: '', bio: 'Расскажите о себе', followers: 0, following: 0, savedPostIds: [] }
    ],
    posts: [],
    stories: [],
    videos: [],
    places: [],
    people: [],
    collections: []
  };
}

function normalizeDb(db) {
  db.meta ||= { createdAt: nowIso(), app: 'mig' };
  db.meta.updatedAt = db.meta.updatedAt || nowIso();
  db.users ||= [];
  db.posts ||= [];
  db.stories ||= [];
  db.videos ||= [];
  db.places ||= [];
  db.people ||= [];
  db.collections ||= [];
  db.users.forEach((u) => { u.savedPostIds ||= []; u.avatarUrl ||= ''; });
  db.posts.forEach((p) => { p.likedBy ||= []; p.comments ||= []; p.imageUrl ||= ''; });
  db.videos.forEach((v) => { v.likedBy ||= []; v.comments ||= []; v.imageUrl ||= ''; });
  db.places.forEach((p) => { p.checkins = Number(p.checkins || 0); p.imageUrl ||= ''; });
  return db;
}

function readDb() {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    const initial = seed();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return normalizeDb(JSON.parse(fs.readFileSync(DB_PATH, 'utf8')));
}

function writeDb(db) {
  ensureDataDir();
  db.meta ||= {};
  db.meta.updatedAt = nowIso();
  fs.writeFileSync(DB_PATH, JSON.stringify(normalizeDb(db), null, 2));
}

function formatCompact(number) {
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
  return String(number);
}

function timeLabel(createdAt) {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ч`;
  return `${Math.round(hours / 24)} д`;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    handle: user.handle,
    avatarKey: user.avatarKey,
    avatarUrl: user.avatarUrl || '',
    bio: user.bio,
    followersLabel: formatCompact(user.followers || 0),
    following: user.following || 0
  };
}

function shape(db, viewerId) {
  const viewer = db.users.find((u) => u.id === viewerId) || db.users[0];
  const usersById = new Map(db.users.map((u) => [u.id, u]));
  const posts = db.posts
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((post) => {
      const author = usersById.get(post.authorId) || viewer;
      return {
        id: post.id,
        author: publicUser(author),
        imageKey: post.imageKey,
        imageUrl: post.imageUrl || '',
        caption: post.caption,
        location: post.location,
        timeLabel: timeLabel(post.createdAt),
        likes: post.likedBy.length,
        liked: post.likedBy.includes(viewer.id),
        saved: viewer.savedPostIds.includes(post.id),
        commentsCount: post.comments.length,
        comments: post.comments.map((comment) => ({
          id: comment.id,
          authorName: usersById.get(comment.userId)?.handle || '@user',
          text: comment.text,
          createdAt: comment.createdAt
        }))
      };
    });
  const currentUserPostsCount = db.posts.filter((post) => post.authorId === viewer.id).length;
  return {
    currentUser: { ...publicUser(viewer), postsCount: currentUserPostsCount },
    posts,
    stories: db.stories.map((story) => ({ ...story, imageUrl: story.imageUrl || '', own: story.userId === viewer.id || story.own })),
    videos: db.videos.map((video) => {
      const author = usersById.get(video.authorId) || viewer;
      const likes = video.likedBy.length;
      return {
        id: video.id,
        author: publicUser(author),
        imageKey: video.imageKey,
        imageUrl: video.imageUrl || '',
        caption: video.caption,
        location: video.location,
        likes,
        likesLabel: formatCompact(likes),
        liked: video.likedBy.includes(viewer.id),
        commentsCount: video.comments.length
      };
    }),
    places: db.places,
    people: db.people,
    collections: db.collections
      .filter((collection) => collection.userId === viewer.id)
      .map((collection) => ({ ...collection, countLabel: `${collection.postIds.length} ${collection.postIds.length === 1 ? 'пост' : 'постов'}` }))
  };
}

function getUser(db, userId) {
  let user = db.users.find((item) => item.id === userId);
  if (!user) {
    const safeId = String(userId || 'user').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) || id('user');
    user = { id: safeId, name: 'Новый пользователь', handle: `@${safeId}`, avatarKey: 'avatar', avatarUrl: '', bio: '', followers: 0, following: 0, savedPostIds: [] };
    db.users.push(user);
  }
  user.savedPostIds ||= [];
  return user;
}

function ownerTokenFromRequest(req) {
  const auth = req.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  return req.get('x-owner-token') || req.query.token || req.body?.token || '';
}

function requireOwner(req, res, next) {
  if (ownerTokenFromRequest(req) === OWNER_TOKEN) return next();
  return res.status(401).json({ error: 'owner token is invalid' });
}

function cleanString(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function ownerPayload(db) {
  const usersById = new Map(db.users.map((u) => [u.id, u]));
  const comments = db.posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0) + db.videos.reduce((sum, video) => sum + (video.comments?.length || 0), 0);
  const likes = db.posts.reduce((sum, post) => sum + (post.likedBy?.length || 0), 0) + db.videos.reduce((sum, video) => sum + (video.likedBy?.length || 0), 0);
  const saves = db.users.reduce((sum, user) => sum + (user.savedPostIds?.length || 0), 0);
  const checkins = db.places.reduce((sum, place) => sum + Number(place.checkins || 0), 0);
  return {
    meta: {
      env: NODE_ENV,
      publicUrl: PUBLIC_URL,
      dataDir: DATA_DIR,
      updatedAt: db.meta?.updatedAt || null,
      defaultOwnerToken: OWNER_TOKEN === 'mig-owner-demo'
    },
    stats: {
      users: db.users.length,
      posts: db.posts.length,
      videos: db.videos.length,
      places: db.places.length,
      stories: db.stories.length,
      collections: db.collections.length,
      comments,
      likes,
      saves,
      checkins
    },
    users: db.users.map((user) => ({ id: user.id, name: user.name, handle: user.handle, avatarKey: user.avatarKey, avatarUrl: user.avatarUrl || '', followers: user.followers || 0, following: user.following || 0 })),
    posts: db.posts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((post) => ({
      ...post,
      authorName: usersById.get(post.authorId)?.name || post.authorId,
      likes: post.likedBy?.length || 0,
      commentsCount: post.comments?.length || 0
    })),
    videos: db.videos.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((video) => ({
      ...video,
      authorName: usersById.get(video.authorId)?.name || video.authorId,
      likes: video.likedBy?.length || 0,
      commentsCount: video.comments?.length || 0
    })),
    places: db.places.slice().sort((a, b) => Number(b.checkins || 0) - Number(a.checkins || 0)),
    collections: db.collections
  };
}

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.get('/', (req, res) => {
  res.type('html').send(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Миг backend</title><style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fbfaff;color:#15142d}.wrap{min-height:100vh;display:grid;place-items:center;padding:28px}.card{width:min(760px,100%);background:white;border:1px solid #eee8fa;border-radius:32px;padding:34px;box-shadow:0 24px 70px rgba(49,32,112,.12)}.logo{width:82px;height:82px;border-radius:28px;background:linear-gradient(135deg,#ff6b6b,#f22d8f 45%,#7b5cff 80%,#2f7bff);margin-bottom:20px;box-shadow:0 18px 46px rgba(242,45,143,.26)}h1{font-size:44px;margin:0 0 10px}.muted{color:#77728d;line-height:1.55}.row{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}a{display:inline-flex;text-decoration:none;color:white;background:#15142d;padding:14px 18px;border-radius:16px;font-weight:800}.ghost{background:#f1effa;color:#15142d}code{background:#f7f4ff;border:1px solid #ece5ff;border-radius:10px;padding:3px 7px}</style></head><body><div class="wrap"><div class="card"><div class="logo"></div><h1>Миг backend</h1><p class="muted">Сервер работает. Для приложения используйте адрес этого домена без пути. Для управления контентом откройте страницу владельца.</p><p class="muted">Проверка API: <code>/api/health</code></p><div class="row"><a href="/owner">Открыть владельца</a><a class="ghost" href="/api/health">Health check</a></div></div></div></body></html>`);
});

app.get('/owner', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'owner.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, name: 'mig-backend', env: NODE_ENV, time: nowIso(), dataDir: DATA_DIR, publicUrl: PUBLIC_URL || null });
});

app.get('/api/bootstrap', (req, res) => {
  const db = readDb();
  const userId = req.query.userId || 'ivan';
  getUser(db, userId);
  writeDb(db);
  res.json(shape(db, userId));
});

app.post('/api/posts', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.body.userId || 'ivan');
  const caption = cleanString(req.body.caption);
  if (!caption) return res.status(400).json({ error: 'caption is required' });
  const post = {
    id: id('post'),
    authorId: user.id,
    imageKey: cleanString(req.body.imageKey, 'lake'),
    imageUrl: cleanString(req.body.imageUrl),
    caption,
    location: cleanString(req.body.location, 'Москва, Россия'),
    mood: cleanString(req.body.mood),
    duration: cleanString(req.body.duration, '24 часа'),
    createdAt: nowIso(),
    likedBy: [],
    comments: []
  };
  db.posts.unshift(post);
  db.stories.unshift({ id: id('story'), userId: user.id, name: 'Ваш миг', imageKey: post.imageKey, imageUrl: post.imageUrl || '', own: true, createdAt: nowIso() });
  writeDb(db);
  res.json(shape(db, user.id));
});

app.post('/api/posts/:id/like', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.body.userId || 'ivan');
  const post = db.posts.find((item) => item.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'post not found' });
  post.likedBy ||= [];
  if (post.likedBy.includes(user.id)) post.likedBy = post.likedBy.filter((id) => id !== user.id);
  else post.likedBy.push(user.id);
  writeDb(db);
  res.json(shape(db, user.id));
});

app.post('/api/posts/:id/save', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.body.userId || 'ivan');
  const post = db.posts.find((item) => item.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'post not found' });
  const saved = !user.savedPostIds.includes(post.id);
  if (saved) {
    user.savedPostIds.push(post.id);
    let savedCollection = db.collections.find((item) => item.userId === user.id && item.title === 'Сохранённое');
    if (!savedCollection) {
      savedCollection = { id: id('collection'), userId: user.id, title: 'Сохранённое', imageKey: post.imageKey, imageUrl: post.imageUrl || '', postIds: [] };
      db.collections.unshift(savedCollection);
    }
    if (!savedCollection.postIds.includes(post.id)) savedCollection.postIds.push(post.id);
  } else {
    user.savedPostIds = user.savedPostIds.filter((id) => id !== post.id);
    db.collections.forEach((collection) => {
      if (collection.userId === user.id) collection.postIds = collection.postIds.filter((id) => id !== post.id);
    });
  }
  writeDb(db);
  res.json({ ...shape(db, user.id), saved });
});

app.post('/api/posts/:id/comments', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.body.userId || 'ivan');
  const post = db.posts.find((item) => item.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'post not found' });
  const text = cleanString(req.body.text);
  if (!text) return res.status(400).json({ error: 'text is required' });
  post.comments ||= [];
  post.comments.push({ id: id('comment'), userId: user.id, text, createdAt: nowIso() });
  writeDb(db);
  res.json(shape(db, user.id));
});

app.post('/api/videos/:id/like', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.body.userId || 'ivan');
  const video = db.videos.find((item) => item.id === req.params.id);
  if (!video) return res.status(404).json({ error: 'video not found' });
  video.likedBy ||= [];
  if (video.likedBy.includes(user.id)) video.likedBy = video.likedBy.filter((id) => id !== user.id);
  else video.likedBy.push(user.id);
  writeDb(db);
  res.json(shape(db, user.id));
});

app.post('/api/places/:id/checkin', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.body.userId || 'ivan');
  const place = db.places.find((item) => item.id === req.params.id);
  if (!place) return res.status(404).json({ error: 'place not found' });
  place.checkins = Number(place.checkins || 0) + 1;
  writeDb(db);
  res.json(shape(db, user.id));
});

app.post('/api/profile', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.body.userId || 'ivan');
  const name = cleanString(req.body.name);
  const bio = cleanString(req.body.bio);
  if (name) user.name = name;
  user.bio = bio;
  writeDb(db);
  res.json(shape(db, user.id));
});

app.post('/api/collections', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.body.userId || 'ivan');
  const title = cleanString(req.body.title);
  if (!title) return res.status(400).json({ error: 'title is required' });
  const images = ['collectionCafe', 'collectionStyle', 'collectionNight', 'collectionWeekend', 'lake', 'city'];
  db.collections.unshift({ id: id('collection'), userId: user.id, title, imageKey: images[db.collections.length % images.length], postIds: [] });
  writeDb(db);
  res.json(shape(db, user.id));
});

// Owner API
app.get('/api/owner/summary', requireOwner, (req, res) => {
  res.json(ownerPayload(readDb()));
});

app.get('/api/owner/export', requireOwner, (req, res) => {
  const db = readDb();
  res.setHeader('Content-Disposition', `attachment; filename="mig-db-${Date.now()}.json"`);
  res.json(db);
});

app.post('/api/owner/reset', requireOwner, (req, res) => {
  const next = seed();
  writeDb(next);
  res.json(ownerPayload(next));
});

app.post('/api/owner/posts', requireOwner, (req, res) => {
  const db = readDb();
  const authorId = cleanString(req.body.authorId, 'ivan');
  getUser(db, authorId);
  const caption = cleanString(req.body.caption);
  if (!caption) return res.status(400).json({ error: 'caption is required' });
  db.posts.unshift({
    id: id('post'),
    authorId,
    imageKey: cleanString(req.body.imageKey, 'lake'),
    imageUrl: cleanString(req.body.imageUrl),
    caption,
    location: cleanString(req.body.location, 'Москва, Россия'),
    createdAt: nowIso(),
    likedBy: [],
    comments: []
  });
  writeDb(db);
  res.json(ownerPayload(db));
});

app.patch('/api/owner/posts/:id', requireOwner, (req, res) => {
  const db = readDb();
  const post = db.posts.find((item) => item.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'post not found' });
  ['caption', 'location', 'imageKey', 'imageUrl', 'authorId'].forEach((key) => {
    if (req.body[key] !== undefined) post[key] = cleanString(req.body[key], post[key]);
  });
  writeDb(db);
  res.json(ownerPayload(db));
});

app.delete('/api/owner/posts/:id', requireOwner, (req, res) => {
  const db = readDb();
  db.posts = db.posts.filter((item) => item.id !== req.params.id);
  db.collections.forEach((collection) => { collection.postIds = (collection.postIds || []).filter((postId) => postId !== req.params.id); });
  db.users.forEach((user) => { user.savedPostIds = (user.savedPostIds || []).filter((postId) => postId !== req.params.id); });
  writeDb(db);
  res.json(ownerPayload(db));
});

app.post('/api/owner/videos', requireOwner, (req, res) => {
  const db = readDb();
  const authorId = cleanString(req.body.authorId, 'mari');
  getUser(db, authorId);
  const caption = cleanString(req.body.caption);
  if (!caption) return res.status(400).json({ error: 'caption is required' });
  db.videos.unshift({
    id: id('video'),
    authorId,
    imageKey: cleanString(req.body.imageKey, 'dancer'),
    imageUrl: cleanString(req.body.imageUrl),
    caption,
    location: cleanString(req.body.location, 'Москва'),
    createdAt: nowIso(),
    likedBy: [],
    comments: []
  });
  writeDb(db);
  res.json(ownerPayload(db));
});

app.patch('/api/owner/videos/:id', requireOwner, (req, res) => {
  const db = readDb();
  const video = db.videos.find((item) => item.id === req.params.id);
  if (!video) return res.status(404).json({ error: 'video not found' });
  ['caption', 'location', 'imageKey', 'imageUrl', 'authorId'].forEach((key) => {
    if (req.body[key] !== undefined) video[key] = cleanString(req.body[key], video[key]);
  });
  writeDb(db);
  res.json(ownerPayload(db));
});

app.delete('/api/owner/videos/:id', requireOwner, (req, res) => {
  const db = readDb();
  db.videos = db.videos.filter((item) => item.id !== req.params.id);
  writeDb(db);
  res.json(ownerPayload(db));
});

app.post('/api/owner/places', requireOwner, (req, res) => {
  const db = readDb();
  const name = cleanString(req.body.name);
  if (!name) return res.status(400).json({ error: 'name is required' });
  db.places.unshift({
    id: id('place'),
    name,
    distance: cleanString(req.body.distance, 'рядом'),
    imageKey: cleanString(req.body.imageKey, 'cafe'),
    imageUrl: cleanString(req.body.imageUrl),
    checkins: Number(req.body.checkins || 0)
  });
  writeDb(db);
  res.json(ownerPayload(db));
});

app.patch('/api/owner/places/:id', requireOwner, (req, res) => {
  const db = readDb();
  const place = db.places.find((item) => item.id === req.params.id);
  if (!place) return res.status(404).json({ error: 'place not found' });
  ['name', 'distance', 'imageKey', 'imageUrl'].forEach((key) => {
    if (req.body[key] !== undefined) place[key] = cleanString(req.body[key], place[key]);
  });
  if (req.body.checkins !== undefined) place.checkins = Number(req.body.checkins || 0);
  writeDb(db);
  res.json(ownerPayload(db));
});

app.delete('/api/owner/places/:id', requireOwner, (req, res) => {
  const db = readDb();
  db.places = db.places.filter((item) => item.id !== req.params.id);
  writeDb(db);
  res.json(ownerPayload(db));
});

app.patch('/api/owner/users/:id', requireOwner, (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  ['name', 'handle', 'bio', 'avatarKey', 'avatarUrl'].forEach((key) => {
    if (req.body[key] !== undefined) user[key] = cleanString(req.body[key], user[key]);
  });
  if (req.body.followers !== undefined) user.followers = Number(req.body.followers || 0);
  if (req.body.following !== undefined) user.following = Number(req.body.following || 0);
  writeDb(db);
  res.json(ownerPayload(db));
});

function localAddresses() {
  const nets = os.networkInterfaces();
  const results = [];
  Object.values(nets).forEach((items) => {
    (items || []).forEach((item) => {
      if (item.family === 'IPv4' && !item.internal) results.push(item.address);
    });
  });
  return results;
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mig backend is running on port ${PORT}`);
  console.log(`Local:   http://localhost:${PORT}`);
  localAddresses().forEach((address) => console.log(`Phone:   http://${address}:${PORT}`));
  console.log(`Owner:   http://localhost:${PORT}/owner`);
  console.log(`Health:  /api/health`);
  if (OWNER_TOKEN === 'mig-owner-demo') console.log('Owner token: mig-owner-demo (set OWNER_TOKEN on Railway for production)');
});
