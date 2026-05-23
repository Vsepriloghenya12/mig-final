const crypto = require('crypto');
const { getUser } = require('./db');

function createSessionToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function ensureSession(user) {
  if (!user.sessionToken) user.sessionToken = createSessionToken();
  return user.sessionToken;
}

function userIdFromRequest(req) {
  return req.get('x-user-id') || req.body?.userId || req.query?.userId || '';
}

function tokenFromRequest(req) {
  const auth = req.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  return req.get('x-user-token') || req.body?.authToken || req.query?.authToken || '';
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function assertSession(user, req) {
  const token = tokenFromRequest(req);
  if (!user || !token || !user.sessionToken || !safeEqual(token, user.sessionToken)) {
    const error = new Error('Сессия недействительна. Войдите заново.');
    error.status = 401;
    throw error;
  }
  if (user.status === 'blocked') {
    const error = new Error('Аккаунт заблокирован');
    error.status = 403;
    throw error;
  }
  return user;
}

function sessionPayload(user) {
  return { id: user.id, name: user.name, handle: user.handle, authToken: ensureSession(user) };
}

function requireUserSession(req, res, next) {
  if (['HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.path === '/users' || req.path.startsWith('/owner')) return next();

  const db = req.app.locals.readDb();
  const userId = userIdFromRequest(req);
  const user = db.users.find((u) => u.id === userId);

  try { assertSession(user, req); return next(); } catch (e) { return res.status(e.status || 401).json({ error: e.message }); }
}

function getRequestUser(db, req) {
  const user = getUser(db, userIdFromRequest(req) || `user_${Date.now()}`);
  ensureSession(user);
  return user;
}

module.exports = { createSessionToken, ensureSession, assertSession, sessionPayload, userIdFromRequest, tokenFromRequest, requireUserSession, getRequestUser };
