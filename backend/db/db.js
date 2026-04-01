const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const defaultDbPath = path.join(__dirname, '..', 'fintrust.db');
const dbPath = process.env.DATABASE_PATH || defaultDbPath;

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new sqlite3.Database(dbPath);

const loanColumns = [
  'id INTEGER PRIMARY KEY AUTOINCREMENT',
  'name TEXT',
  'first_name TEXT',
  'last_name TEXT',
  'id_number TEXT',
  'phone TEXT',
  'mpesa_phone TEXT',
  'amount REAL',
  'monthly_income REAL',
  'employment_status TEXT',
  'loan_term_months INTEGER',
  'term_days INTEGER',
  'interest REAL',
  'total_amount REAL',
  'paid_amount REAL DEFAULT 0',
  'payment_requested_amount REAL DEFAULT 0',
  'payment_received_at DATETIME',
  "status TEXT DEFAULT 'application_submitted'",
  "payment_status TEXT DEFAULT 'not_initiated'",
  'mpesa_checkout_request_id TEXT',
  'mpesa_merchant_request_id TEXT',
  'mpesa_receipt_number TEXT',
  'mpesa_result_code TEXT',
  'mpesa_result_desc TEXT',
  'mpesa_requested_at DATETIME',
  'mpesa_transaction_date DATETIME',
  'mpesa_callback_payload TEXT',
  'approval_sms_status TEXT',
  'approval_sms_sent_at DATETIME',
  'approval_sms_error TEXT',
  'created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
  'due_date DATETIME'
];

const requiredColumns = {
  first_name: 'TEXT',
  last_name: 'TEXT',
  id_number: 'TEXT',
  mpesa_phone: 'TEXT',
  monthly_income: 'REAL',
  employment_status: 'TEXT',
  loan_term_months: 'INTEGER',
  total_amount: 'REAL',
  paid_amount: 'REAL DEFAULT 0',
  payment_requested_amount: 'REAL DEFAULT 0',
  payment_received_at: 'DATETIME',
  status: "TEXT DEFAULT 'application_submitted'",
  payment_status: "TEXT DEFAULT 'not_initiated'",
  mpesa_checkout_request_id: 'TEXT',
  mpesa_merchant_request_id: 'TEXT',
  mpesa_receipt_number: 'TEXT',
  mpesa_result_code: 'TEXT',
  mpesa_result_desc: 'TEXT',
  mpesa_requested_at: 'DATETIME',
  mpesa_transaction_date: 'DATETIME',
  mpesa_callback_payload: 'TEXT',
  approval_sms_status: 'TEXT',
  approval_sms_sent_at: 'DATETIME',
  approval_sms_error: 'TEXT'
};

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS loans (${loanColumns.join(', ')})`);

  db.all('PRAGMA table_info(loans)', (err, columns) => {
    if (err) {
      console.error('Failed to inspect loan table:', err.message);
      return;
    }

    const existingColumns = new Set(columns.map((column) => column.name));

    Object.entries(requiredColumns).forEach(([columnName, definition]) => {
      if (!existingColumns.has(columnName)) {
        db.run(
          `ALTER TABLE loans ADD COLUMN ${columnName} ${definition}`,
          (alterErr) => {
            if (alterErr) {
              console.error(`Failed to add ${columnName} column:`, alterErr.message);
            }
          }
        );
      }
    });
  });
});

module.exports = db;
