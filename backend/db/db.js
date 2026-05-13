const fs = require('fs');
const path = require('path');

const isPostgres = /^postgres(?:ql)?:\/\//i.test(process.env.DATABASE_URL || '');

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

const loanIndexes = [
  { name: 'idx_loans_created_at', columnList: 'created_at' },
  { name: 'idx_loans_payment_status', columnList: 'payment_status' },
  { name: 'idx_loans_payment_received_at', columnList: 'payment_received_at' },
  { name: 'idx_loans_mpesa_requested_at', columnList: 'mpesa_requested_at' },
  { name: 'idx_loans_checkout_request_id', columnList: 'mpesa_checkout_request_id' },
  { name: 'idx_loans_merchant_request_id', columnList: 'mpesa_merchant_request_id' }
];

const runSqliteMigrations = (db) => {
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
          db.run(`ALTER TABLE loans ADD COLUMN ${columnName} ${definition}`, (alterErr) => {
            if (alterErr) {
              console.error(`Failed to add ${columnName} column:`, alterErr.message);
            }
          });
        }
      });

      loanIndexes.forEach(({ name, columnList }) => {
        db.run(`CREATE INDEX IF NOT EXISTS ${name} ON loans (${columnList})`, (indexErr) => {
          if (indexErr) {
            console.error(`Failed to create ${name}:`, indexErr.message);
          }
        });
      });
    });
  });
};

const toPostgresDefinition = (definition, columnName) => {
  if (columnName === 'id') {
    return 'id SERIAL PRIMARY KEY';
  }

  return definition
    .replace(/\bREAL\b/g, 'DOUBLE PRECISION')
    .replace(/\bDATETIME\b/g, 'TIMESTAMPTZ')
    .replace(/DEFAULT CURRENT_TIMESTAMP/g, 'DEFAULT CURRENT_TIMESTAMP');
};

const toPostgresSql = (sql) => {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
};

const createPostgresDb = () => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('render.com')
      ? { rejectUnauthorized: false }
      : undefined,
  });

  const postgresColumns = loanColumns.map((definition) => {
    const columnName = definition.split(/\s+/)[0];
    return toPostgresDefinition(definition, columnName);
  });

  const ready = (async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS loans (${postgresColumns.join(', ')})`);

    const { rows } = await pool.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'loans'`
    );
    const existingColumns = new Set(rows.map((row) => row.column_name));

    for (const [columnName, definition] of Object.entries(requiredColumns)) {
      if (!existingColumns.has(columnName)) {
        await pool.query(
          `ALTER TABLE loans ADD COLUMN ${columnName} ${toPostgresDefinition(definition, columnName)}`
        );
      }
    }

    for (const { name, columnList } of loanIndexes) {
      await pool.query(`CREATE INDEX IF NOT EXISTS ${name} ON loans (${columnList})`);
    }
  })().catch((error) => {
    console.error('Failed to initialize Postgres database:', error.message);
    throw error;
  });

  const query = async (sql, params = []) => {
    await ready;

    let statement = toPostgresSql(sql);
    if (/^\s*INSERT\s+INTO\s+loans\b/i.test(statement) && !/\bRETURNING\b/i.test(statement)) {
      statement = `${statement} RETURNING id`;
    }

    return pool.query(statement, params);
  };

  return {
    run(sql, params = [], callback = () => {}) {
      query(sql, params)
        .then((result) => {
          callback.call(
            {
              lastID: result.rows[0]?.id,
              changes: result.rowCount,
            },
            null
          );
        })
        .catch((error) => callback(error));
    },
    all(sql, params = [], callback = () => {}) {
      query(sql, params)
        .then((result) => callback(null, result.rows))
        .catch((error) => callback(error));
    },
    get(sql, params = [], callback = () => {}) {
      query(sql, params)
        .then((result) => callback(null, result.rows[0]))
        .catch((error) => callback(error));
    },
    close(callback = () => {}) {
      pool.end(callback);
    },
  };
};

const createSqliteDb = () => {
  const sqlite3 = require('sqlite3').verbose();
  const defaultDbPath = path.join(__dirname, '..', 'fintrust.db');
  const dbPath = process.env.DATABASE_PATH || defaultDbPath;

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new sqlite3.Database(dbPath);
  runSqliteMigrations(db);

  return db;
};

module.exports = isPostgres ? createPostgresDb() : createSqliteDb();
