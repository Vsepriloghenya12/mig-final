const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { id, nowIso, clean, timeLabel } = require('../lib/utils');
const { publicUser } = require('../lib/shape');
const { result, assertTurn } = require('../lib/games');
const { notifyUser, gameName } = require('../lib/push');
const router = express.Router();

router.get('/dialogs', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.query.userId);
  res.json({ dialogs: dialogs(db, user.id) });
});

router.post('/dialogs', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.body.userId);
  const target = getUser(db, req.body.targetId);
  if (blocked(db, user.id, target.id)) return res.status(403).json({ error: 'Диалог недоступен' });
  if (user.id === target.id) return res.status(400).json({ error: 'Нельзя написать себе' });
  let dialog = findDirectDialog(db, user.id, target.id);
  if (!dialog) {
    dialog = { id: id('dialog'), type: 'direct', participantIds: [user.id, target.id], createdAt: nowIso(), updatedAt: nowIso() };
    db.dialogs.push(dialog);
    writeDb(db);
  }
  res.json({ dialog: dialogShape(db, dialog, user.id) });
});

router.post('/dialogs/group', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.body.userId);
  const rawIds = Array.isArray(req.body.participantIds) ? req.body.participantIds : [];
  const participantIds = [...new Set([user.id, ...rawIds.map((x) => clean(x)).filter(Boolean)])]
    .filter((pid) => db.users.some((u) => u.id === pid));
  if (participantIds.length < 3) return res.status(400).json({ error: 'Для группы выберите минимум двух собеседников.' });
  const unavailable = participantIds.find((pid) => pid !== user.id && blocked(db, user.id, pid));
  if (unavailable) return res.status(403).json({ error: 'Один из участников недоступен.' });
  const title = clean(req.body.title, groupTitle(db, participantIds, user.id)).slice(0, 64);
  const dialog = { id: id('dialog'), type: 'group', title, participantIds, createdBy: user.id, createdAt: nowIso(), updatedAt: nowIso() };
  db.dialogs.push(dialog);
  writeDb(db);
  res.json({ dialog: dialogShape(db, dialog, user.id) });
});

router.get('/dialogs/:id/messages', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.query.userId);
  const dialog = requireDialog(db, req.params.id, user.id, res);
  if (!dialog) return;
  db.messages.forEach((m) => {
    if (m.dialogId === dialog.id && m.userId !== user.id) {
      m.readBy ||= [];
      if (!m.readBy.includes(user.id)) m.readBy.push(user.id);
    }
  });
  writeDb(db);
  res.json({ messages: messages(db, dialog.id, user.id) });
});

router.post('/dialogs/:id/messages', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.body.userId);
  const dialog = requireDialog(db, req.params.id, user.id, res);
  if (!dialog) return;
  const recipients = dialog.participantIds.filter((pid) => pid !== user.id);
  const unavailable = recipients.find((pid) => blocked(db, user.id, pid));
  if (unavailable) return res.status(403).json({ error: 'Пользователь заблокирован' });
  const type = req.body.type || 'text';
  const message = { id: id('msg'), dialogId: dialog.id, userId: user.id, type, text: clean(req.body.text), mediaUrl: clean(req.body.mediaUrl), mediaType: type, readBy: [user.id], createdAt: nowIso() };
  db.messages.push(message);
  dialog.updatedAt = message.createdAt;
  recipients.forEach((recipientId) => notifyUser(db, recipientId, { title: dialog.type === 'group' ? (dialog.title || 'Группа') : (user.name || 'Близз'), body: messageBody(type, req.body.text), data: { type: 'message', dialogId: dialog.id } }));
  writeDb(db);
  res.json({ ok: true, message });
});

router.post('/dialogs/:id/games', (req, res) => {
  const db = readDb();
  const user = getUser(db, req.body.userId);
  const dialog = requireDialog(db, req.params.id, user.id, res);
  if (!dialog) return;
  if (dialog.type === 'group' || dialog.participantIds.length !== 2) return res.status(400).json({ error: 'Игры доступны только в личном диалоге.' });
  const opponentId = dialog.participantIds.find((x) => x !== user.id);
  if (blocked(db, user.id, opponentId)) return res.status(403).json({ error: 'Игра недоступна' });
  const game = { id: id('game'), dialogId: dialog.id, type: req.body.gameType || 'cups', creatorId: user.id, opponentId, status: 'pending_acceptance', createdAt: nowIso() };
  db.games.push(game);
  db.messages.push({ id: id('msg'), dialogId: dialog.id, userId: user.id, type: 'game', gameId: game.id, readBy: [user.id], createdAt: nowIso() });
  dialog.updatedAt = nowIso();
  notifyUser(db, opponentId, { title: 'Приглашение в игру', body: `${user.name || 'Пользователь'}: ${gameName(game.type)}`, data: { type: 'game', dialogId: dialog.id, gameId: game.id } });
  writeDb(db);
  res.json({ game });
});

router.post('/games/:id/accept', (req, res) => updateGame(req, res, (g, user, db) => { if (blocked(db, g.creatorId, g.opponentId)) throw new Error('Игра недоступна'); if (g.status !== 'pending_acceptance') throw new Error('Игра уже началась'); if (g.opponentId !== user.id) throw new Error('Подтвердить должен собеседник'); g.status = 'creator_turn'; notifyUser(db, g.creatorId, { title: 'Игра принята', body: `${user.name || 'Собеседник'} принял игру`, data: { type: 'game', dialogId: g.dialogId, gameId: g.id } }); }));
router.post('/games/:id/decline', (req, res) => updateGame(req, res, (g, user, db) => { if (!isParticipant(g, user.id)) throw new Error('Нет доступа к игре'); if (g.status !== 'pending_acceptance') throw new Error('Игру уже нельзя отклонить'); g.status = 'declined'; notifyUser(db, g.creatorId, { title: 'Игра отклонена', body: `${user.name || 'Собеседник'} отклонил игру`, data: { type: 'game', dialogId: g.dialogId, gameId: g.id } }); }));
router.post('/games/:id/move', (req, res) => updateGame(req, res, (g, user, db) => { if (blocked(db, g.creatorId, g.opponentId)) throw new Error('Игра недоступна'); if (!isParticipant(g, user.id)) throw new Error('Нет доступа к игре'); const key = assertTurn(g, user.id); if (g[key]) throw new Error('Вы уже сделали ход'); g[key] = String(req.body.choice); g.status = key === 'creatorChoice' ? 'opponent_turn' : 'finished'; if (g.status === 'finished') g.result = result(g); notifyGameMove(db, g, user.id); }));

function dialogs(db, userId) {
  return db.dialogs
    .filter((d) => d.participantIds.includes(userId))
    .filter((d) => !(d.participantIds || []).some((pid) => pid !== userId && blocked(db, userId, pid)))
    .sort((a, b) => when(b.updatedAt || b.createdAt) - when(a.updatedAt || a.createdAt))
    .map((d) => dialogShape(db, d, userId));
}
function dialogShape(db, dialog, userId) {
  const others = (dialog.participantIds || []).filter((pid) => pid !== userId).map((pid) => publicUser(db.users.find((u) => u.id === pid))).filter(Boolean);
  const last = db.messages.filter((m) => m.dialogId === dialog.id && m.status !== 'deleted').slice(-1)[0];
  const unread = db.messages.filter((m) => m.dialogId === dialog.id && m.userId !== userId && m.status !== 'deleted' && !(m.readBy || []).includes(userId)).length;
  const isGroup = dialog.type === 'group' || others.length > 1;
  const title = isGroup ? (dialog.title || groupTitle(db, dialog.participantIds, userId)) : undefined;
  return { ...dialog, isGroup, title, users: others, user: others[0], lastText: lastText(last), lastAt: last?.createdAt || dialog.updatedAt || dialog.createdAt, timeLabel: timeLabel(last?.createdAt || dialog.updatedAt || dialog.createdAt), unread, unreadCount: unread };
}
function messages(db, dialogId) { return db.messages.filter((m) => m.dialogId === dialogId && m.status !== 'deleted').map((m) => m.type === 'game' ? { ...m, game: db.games.find((g) => g.id === m.gameId) } : m); }
function findDirectDialog(db, a, b) { return db.dialogs.find((d) => (d.type || 'direct') !== 'group' && d.participantIds.length === 2 && d.participantIds.includes(a) && d.participantIds.includes(b)); }
function requireDialog(db, id, userId, res) { const d = db.dialogs.find((x) => x.id === id); if (!d || !d.participantIds.includes(userId)) { res.status(403).json({ error: 'Нет доступа к диалогу' }); return null; } return d; }
function blocked(db, a, b) { const ua = db.users.find((u) => u.id === a); const ub = db.users.find((u) => u.id === b); return ua?.status === 'blocked' || ub?.status === 'blocked' || ua?.blockedUserIds?.includes(b) || ub?.blockedUserIds?.includes(a); }
function isParticipant(g, userId) { return g.creatorId === userId || g.opponentId === userId; }
function updateGame(req, res, fn) { try { const db = readDb(); const user = getUser(db, req.body.userId); const game = db.games.find((g) => g.id === req.params.id); if (!game) return res.status(404).json({ error: 'game not found' }); fn(game, user, db); game.updatedAt = nowIso(); writeDb(db); res.json({ game }); } catch (e) { res.status(400).json({ error: e.message }); } }
function messageBody(type, text) { if (type === 'photo') return 'Отправил фото'; if (type === 'video') return 'Отправил видео'; return clean(text, 'Новое сообщение'); }
function lastText(last) { if (!last) return ''; if (last.type === 'game') return 'Игра'; return last.text || (last.type === 'photo' ? 'Фото' : last.type === 'video' ? 'Видео' : ''); }
function groupTitle(db, participantIds, userId) { return (participantIds || []).filter((id) => id !== userId).map((id) => db.users.find((u) => u.id === id)?.name || db.users.find((u) => u.id === id)?.handle).filter(Boolean).slice(0, 3).join(', ') || 'Группа'; }
function when(value) { return value ? new Date(value).getTime() : 0; }
function notifyGameMove(db, g, actorId) { const otherId = actorId === g.creatorId ? g.opponentId : g.creatorId; const body = g.status === 'finished' ? 'Игра завершена' : 'Ваш ход в игре'; notifyUser(db, otherId, { title: gameName(g.type), body, data: { type: 'game', dialogId: g.dialogId, gameId: g.id } }); }
module.exports = router;
