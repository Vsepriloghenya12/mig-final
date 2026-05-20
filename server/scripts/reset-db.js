const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'db.json');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
console.log('Database reset. Run npm start to create seed data.');
