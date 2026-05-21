const express = require('express');
const { readDb, resetDb } = require('../lib/db');
const router = express.Router();
const OWNER_TOKEN = process.env.OWNER_TOKEN || 'mig-owner-demo';

function token(req) { return req.get('x-owner-token') || req.query.token || req.body?.token || ''; }
function guard(req, res, next) { return token(req) === OWNER_TOKEN ? next() : res.status(401).json({ error: 'owner token is invalid' }); }
router.get('/owner/data', guard, (req, res) => res.json(readDb()));
router.post('/owner/reset', guard, (req, res) => res.json(resetDb()));
module.exports = router;
