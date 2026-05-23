const express = require('express');
const cors = require('cors');
const path = require('path');
const { DATA_DIR, UPLOAD_DIR, readDb } = require('./lib/db');
const { requireUserSession } = require('./lib/auth');

const app = express();
app.locals.readDb = readDb;
const PORT = Number(process.env.PORT || 4000);
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.type('html').send(homeHtml()));
app.get('/owner', (req, res) => res.sendFile(path.join(__dirname, 'public', 'owner.html')));
app.get('/delete-account', (req, res) => res.sendFile(path.join(__dirname, 'public', 'delete-account.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, 'public', 'terms.html')));
app.get('/community-guidelines', (req, res) => res.sendFile(path.join(__dirname, 'public', 'community-guidelines.html')));
app.get('/moderation-policy', (req, res) => res.sendFile(path.join(__dirname, 'public', 'moderation-policy.html')));
app.get('/support', (req, res) => res.sendFile(path.join(__dirname, 'public', 'support.html')));
app.use('/api', require('./routes/users'));
app.use('/api', require('./routes/bootstrap'));
app.use('/api', requireUserSession);
app.use('/api', require('./routes/media'));
app.use('/api', require('./routes/content'));
app.use('/api', require('./routes/reactions'));
app.use('/api', require('./routes/moderation'));
app.use('/api', require('./routes/push'));
app.use('/api', require('./routes/profile'));
app.use('/api', require('./routes/chat'));
app.use('/api', require('./routes/owner'));

app.listen(PORT, () => console.log(`Mig backend on :${PORT}; data ${DATA_DIR}`));

function homeHtml() {
  return `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Миг backend</title><style>body{margin:0;font-family:system-ui;background:#fbfaff;color:#15142d}.wrap{min-height:100vh;display:grid;place-items:center;padding:28px}.card{max-width:720px;background:white;border:1px solid #eee8fa;border-radius:30px;padding:32px;box-shadow:0 24px 70px #3120701f}.logo{width:72px;height:72px;border-radius:24px;background:linear-gradient(135deg,#ff6b6b,#f22d8f,#7b5cff,#2f7bff)}a{display:inline-flex;margin-top:20px;background:#f22d8f;color:white;text-decoration:none;padding:13px 18px;border-radius:18px;font-weight:800}</style><div class="wrap"><div class="card"><div class="logo"></div><h1>Миг backend</h1><p>Сервер работает. Health: <code>/api/health</code></p><a href="/owner">Страница владельца</a><a style="margin-left:10px" href="/privacy">Privacy</a><a style="margin-left:10px" href="/terms">Terms</a><a style="margin-left:10px" href="/support">Support</a><a style="margin-left:10px" href="/delete-account">Удаление аккаунта</a></div></div>`;
}
