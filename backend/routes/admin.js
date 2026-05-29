const express = require('express');
const router = express.Router();
const db = require('../db/db');

let ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'loanvia2025';
let ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'loanvia-admin-secret-token';

// Simple token auth middleware
const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const inputUser = (username || '').trim().toLowerCase();
  const inputPass = (password || '');

  // Build all accepted username variants from ADMIN_USERNAME
  const configuredUser = (ADMIN_USERNAME || '').trim().toLowerCase();
  const configuredLocalPart = configuredUser.includes('@') ? configuredUser.split('@')[0] : configuredUser;

  const usernameMatch =
    inputUser === configuredUser ||
    inputUser === configuredLocalPart ||
    (inputUser.includes('@') && inputUser.split('@')[0] === configuredLocalPart);

  if (usernameMatch && inputPass === ADMIN_PASSWORD) {
    return res.json({ token: ADMIN_TOKEN, username: ADMIN_USERNAME });
  }

  console.log(`[admin] Failed login attempt for username: "${username}"`);
  return res.status(401).json({ error: 'Invalid credentials' });
});

// GET /api/admin/stats — overview metrics
router.get('/stats', requireAuth, (req, res) => {
  const queries = {
    totalRevenue: `SELECT COALESCE(SUM(paid_amount), 0) AS value FROM loans WHERE payment_status = 'paid'`,
    totalPaid: `SELECT COUNT(*) AS value FROM loans WHERE payment_status = 'paid'`,
    totalPending: `SELECT COUNT(*) AS value FROM loans WHERE payment_status = 'pending'`,
    totalFailed: `SELECT COUNT(*) AS value FROM loans WHERE payment_status = 'failed'`,
    totalApplications: `SELECT COUNT(*) AS value FROM loans`,
    todayRevenue: `SELECT COALESCE(SUM(paid_amount), 0) AS value FROM loans WHERE payment_status = 'paid' AND DATE(payment_received_at) = DATE('now')`,
    todayTransactions: `SELECT COUNT(*) AS value FROM loans WHERE payment_status = 'paid' AND DATE(payment_received_at) = DATE('now')`,
    weekRevenue: `SELECT COALESCE(SUM(paid_amount), 0) AS value FROM loans WHERE payment_status = 'paid' AND payment_received_at >= datetime('now', '-7 days')`,
    monthRevenue: `SELECT COALESCE(SUM(paid_amount), 0) AS value FROM loans WHERE payment_status = 'paid' AND payment_received_at >= datetime('now', '-30 days')`,
    avgTransactionValue: `SELECT COALESCE(AVG(paid_amount), 0) AS value FROM loans WHERE payment_status = 'paid'`,
  };

  const results = {};
  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach((key) => {
    db.get(queries[key], [], (err, row) => {
      results[key] = err ? 0 : Number(row?.value || 0);
      completed++;
      if (completed === keys.length) {
        const successRate =
          results.totalApplications > 0
            ? ((results.totalPaid / results.totalApplications) * 100).toFixed(1)
            : '0.0';
        res.json({ ...results, successRate: parseFloat(successRate) });
      }
    });
  });
});

// GET /api/admin/analytics/daily — last 30 days daily revenue + count
router.get('/analytics/daily', requireAuth, (req, res) => {
  db.all(
    `SELECT
       DATE(COALESCE(payment_received_at, created_at)) AS date,
       COUNT(*) AS transactions,
       COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN paid_amount ELSE 0 END), 0) AS revenue,
       COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) AS paid,
       COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) AS failed,
       COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) AS pending
     FROM loans
     WHERE COALESCE(payment_received_at, created_at) >= datetime('now', '-30 days')
     GROUP BY DATE(COALESCE(payment_received_at, created_at))
     ORDER BY date ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(rows);
    }
  );
});

// GET /api/admin/analytics/hourly — today's hourly breakdown
router.get('/analytics/hourly', requireAuth, (req, res) => {
  db.all(
    `SELECT
       strftime('%H', COALESCE(payment_received_at, created_at)) AS hour,
       COUNT(*) AS transactions,
       COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN paid_amount ELSE 0 END), 0) AS revenue
     FROM loans
     WHERE DATE(COALESCE(payment_received_at, created_at)) = DATE('now')
     GROUP BY hour
     ORDER BY hour ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(rows);
    }
  );
});

// GET /api/admin/transactions — paginated, filtered
router.get('/transactions', requireAuth, (req, res) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    dateFrom = '',
    dateTo = '',
    sortBy = 'activity_at',
    sortDir = 'DESC',
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push(
      `(name LIKE ? OR phone LIKE ? OR mpesa_phone LIKE ? OR mpesa_receipt_number LIKE ? OR CAST(id AS TEXT) LIKE ?)`
    );
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }

  if (status) {
    conditions.push(`payment_status = ?`);
    params.push(status);
  }

  if (dateFrom) {
    conditions.push(`COALESCE(payment_received_at, created_at) >= ?`);
    params.push(dateFrom);
  }

  if (dateTo) {
    conditions.push(`COALESCE(payment_received_at, created_at) <= ?`);
    params.push(dateTo + ' 23:59:59');
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const allowedSorts = ['activity_at', 'created_at', 'paid_amount', 'name', 'payment_status'];
  const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'activity_at';
  const safeDir = sortDir === 'ASC' ? 'ASC' : 'DESC';

  const baseQuery = `
    SELECT *,
      COALESCE(payment_received_at, mpesa_requested_at, created_at) AS activity_at
    FROM loans
    ${where}
  `;

  db.get(`SELECT COUNT(*) AS total FROM (${baseQuery})`, params, (err, countRow) => {
    if (err) return res.status(400).json({ error: err.message });

    const total = countRow?.total || 0;
    db.all(
      `${baseQuery} ORDER BY ${safeSort} ${safeDir} LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset],
      (err2, rows) => {
        if (err2) return res.status(400).json({ error: err2.message });
        res.json({ total, page: parseInt(page), limit: parseInt(limit), rows });
      }
    );
  });
});

// GET /api/admin/transactions/export — all matching records for CSV/PDF
router.get('/transactions/export', requireAuth, (req, res) => {
  const { search = '', status = '', dateFrom = '', dateTo = '' } = req.query;
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push(`(name LIKE ? OR phone LIKE ? OR mpesa_phone LIKE ? OR mpesa_receipt_number LIKE ? OR CAST(id AS TEXT) LIKE ?)`);
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }
  if (status) { conditions.push(`payment_status = ?`); params.push(status); }
  if (dateFrom) { conditions.push(`COALESCE(payment_received_at, created_at) >= ?`); params.push(dateFrom); }
  if (dateTo) { conditions.push(`COALESCE(payment_received_at, created_at) <= ?`); params.push(dateTo + ' 23:59:59'); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  db.all(
    `SELECT *, COALESCE(payment_received_at, mpesa_requested_at, created_at) AS activity_at
     FROM loans ${where}
     ORDER BY activity_at DESC LIMIT 5000`,
    params,
    (err, rows) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(rows);
    }
  );
});

// GET /api/admin/audit-logs — recent activity log derived from loan records
router.get('/audit-logs', requireAuth, (req, res) => {
  db.all(
    `SELECT
       id,
       name,
       phone,
       mpesa_phone,
       payment_status,
       status,
       paid_amount,
       mpesa_receipt_number,
       mpesa_result_desc,
       mpesa_requested_at,
       payment_received_at,
       created_at,
       approval_sms_status,
       COALESCE(payment_received_at, mpesa_requested_at, created_at) AS activity_at
     FROM loans
     ORDER BY activity_at DESC
     LIMIT 200`,
    [],
    (err, rows) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(rows);
    }
  );
});

// GET /api/admin/settings — get workspace & integration env settings
router.get('/settings', requireAuth, (req, res) => {
  const settings = {};
  const envKeys = [
    'MPESA_ENV',
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
    'MPESA_SHORTCODE',
    'MPESA_PASSKEY',
    'MPESA_CALLBACK_URL',
    'AFRICASTALKING_SMS_ENV',
    'AFRICASTALKING_SMS_USERNAME',
    'AFRICASTALKING_SMS_API_KEY',
    'AFRICASTALKING_SMS_SENDER_ID',
    'DATABASE_URL',
    'DATABASE_PATH',
    'ADMIN_TOKEN',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD'
  ];
  envKeys.forEach(key => {
    settings[key] = process.env[key] || '';
  });
  res.json(settings);
});

// POST /api/admin/settings — save updated workspace & integration env settings
router.post('/settings', requireAuth, (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const envFilePath = path.join(__dirname, '..', '.env');
  const envKeys = [
    'MPESA_ENV',
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
    'MPESA_SHORTCODE',
    'MPESA_PASSKEY',
    'MPESA_CALLBACK_URL',
    'AFRICASTALKING_SMS_ENV',
    'AFRICASTALKING_SMS_USERNAME',
    'AFRICASTALKING_SMS_API_KEY',
    'AFRICASTALKING_SMS_SENDER_ID',
    'DATABASE_URL',
    'DATABASE_PATH',
    'ADMIN_TOKEN',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD'
  ];

  const updates = req.body || {};
  const validatedUpdates = {};
  Object.keys(updates).forEach(key => {
    if (envKeys.includes(key)) {
      validatedUpdates[key] = updates[key];
    }
  });

  try {
    let content = '';
    try {
      content = fs.readFileSync(envFilePath, 'utf8');
    } catch (err) {
      // .env may not exist initially
    }

    const lines = content.split('\n');
    const updatedKeys = new Set();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;
      const parts = line.split('=');
      const key = parts[0].trim();
      if (validatedUpdates.hasOwnProperty(key)) {
        // Find if there is a value or not, replace it
        const index = lines[i].indexOf('=');
        if (index !== -1) {
          lines[i] = `${key}=${validatedUpdates[key]}`;
        }
        updatedKeys.add(key);
      }
    }

    // Add keys not present in .env
    Object.keys(validatedUpdates).forEach(key => {
      if (!updatedKeys.has(key)) {
        lines.push(`${key}=${validatedUpdates[key]}`);
      }
    });

    // Write back to file
    fs.writeFileSync(envFilePath, lines.join('\n'), 'utf8');

    // Update in-memory process.env
    Object.entries(validatedUpdates).forEach(([key, val]) => {
      process.env[key] = val;
    });

    // Reassign internal module parameters
    ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'loanvia2025';
    ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'loanvia-admin-secret-token';

    res.json({ message: 'Settings saved successfully', settings: validatedUpdates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings: ' + error.message });
  }
});

module.exports = { router, requireAuth };
