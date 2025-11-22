const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Submit a new loan
router.post('/', (req, res) => {
  const { name, phone, amount, term_days, interest } = req.body;
  const due_date = new Date(Date.now() + term_days * 24 * 60 * 60 * 1000).toISOString();

  db.run(
    'INSERT INTO loans (name, phone, amount, term_days, interest, due_date) VALUES (?, ?, ?, ?, ?, ?)',
    [name, phone, amount, term_days, interest, due_date],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Loan application submitted', loan_id: this.lastID });
    }
  );
});

// Get all loans (for admin)
router.get('/', (req, res) => {
  db.all('SELECT * FROM loans ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
