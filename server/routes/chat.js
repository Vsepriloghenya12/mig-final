const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { id, nowIso, clean } = require('../lib/utils');
const { publicUser } = require('../lib/shape');
const { result, assertTurn } = require('../lib/games');
const router = express.Router();

router.get('/dialogs', (req, res) => { const db = readDb(); const user = getUser(db, req.query.userId); res.json({ dialogs: dialogs(db, user.id) }); });
router.post('/dialogs', (req, res) => { const db = readDb(); const user = getUser(db, req.body.userId); const target = getUser(db, req.body.targetId); let dialog = findDialog(db, user.id, target.id); if (!dialog) { dialog = { id: id('dialog'), participantIds: [user.id, target.id], createdAt: nowIso() }; db.dialogs.push(dialog); writeDb(db); } res.json({ dialog }); });
router.get('/dialogs/:id/messages', (req, res) => { const db = readDb(); const user = getUser(db, req.query.userId); res.json({ messages: messages(db, req.params.id, user.id) }); });
router.post('/dialogs/:id/messages', (req, res) => { const db = readDb(); const user = getUser(db, req.body.userId); db.messages.push({ id: id('msg'), dialogId: req.params.id, userId: user.id, type: req.body.type || 'text', text: clean(req.body.text), mediaUrl: clean(req.body.mediaUrl), createdAt: nowIso() }); writeDb(db); res.json({ ok: true }); });
router.post('/dialogs/:id/games', (req, res) => { const db = readDb(); const user = getUser(db, req.body.userId); const dialog = db.dialogs.find((d) => d.id === req.params.id); const opponentId = dialog.participantIds.find((x) => x !== user.id); const game = { id: id('game'), dialogId: dialog.id, type: req.body.gameType || 'cups', creatorId: user.id, opponentId, status: 'pending_acceptance', createdAt: nowIso() }; db.games.push(game); db.messages.push({ id: id('msg'), dialogId: dialog.id, userId: user.id, type: 'game', gameId: game.id, createdAt: nowIso() }); writeDb(db); res.json({ game }); });
router.post('/games/:id/accept', (req, res) => updateGame(req, res, (g, user) => { if (g.opponentId !== user.id) throw new Error('Подтвердить должен собеседник'); g.status = 'creator_turn'; }));
router.post('/games/:id/decline', (req, res) => updateGame(req, res, (g) => { g.status = 'declined'; }));
router.post('/games/:id/move', (req, res) => updateGame(req, res, (g, user) => { const key = assertTurn(g, user.id); g[key] = String(req.body.choice); g.status = key === 'creatorChoice' ? 'opponent_turn' : 'finished'; if (g.status === 'finished') g.result = result(g); }));
function dialogs(db, userId) { return db.dialogs.filter((d) => d.participantIds.includes(userId)).map((d) => { const otherId = d.participantIds.find((x) => x !== userId); const last = db.messages.filter((m) => m.dialogId === d.id).slice(-1)[0]; return { ...d, user: publicUser(db.users.find((u) => u.id === otherId)), lastText: last?.type === 'game' ? 'Игра' : last?.text || '' }; }); }
function messages(db, dialogId) { return db.messages.filter((m) => m.dialogId === dialogId).map((m) => m.type === 'game' ? { ...m, game: db.games.find((g) => g.id === m.gameId) } : m); }
function findDialog(db, a, b) { return db.dialogs.find((d) => d.participantIds.includes(a) && d.participantIds.includes(b)); }
function updateGame(req, res, fn) { try { const db = readDb(); const user = getUser(db, req.body.userId); const game = db.games.find((g) => g.id === req.params.id); if (!game) return res.status(404).json({ error: 'game not found' }); fn(game, user); game.updatedAt = nowIso(); writeDb(db); res.json({ game }); } catch (e) { res.status(400).json({ error: e.message }); } }
module.exports = router;
