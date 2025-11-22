const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./fintrust.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    amount REAL,
    term_days INTEGER,
    interest REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME
  )`);
});

module.exports = db;
