const express = require('express');
const { readDb, writeDb, getUser } = require('../lib/db');
const { shape } = require('../lib/shape');
const router = express.Router();

router.get('/bootstrap', (req, res) => {
  const db = readDb();
  const userId = req.query.userId || `user_${Date.now()}`;
  getUser(db, userId); writeDb(db);
  res.json(shape(db, userId));
});
router.get('/health', (req, res) => {
  res.json({ ok: true, name: 'mig-backend', env: process.env.NODE_ENV || 'development', time: new Date().toISOString() });
});
module.exports = router;
