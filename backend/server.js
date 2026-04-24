const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

const defaultAllowedOrigins = [
  'https://loanvia.org',
  'https://www.loanvia.org',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...defaultAllowedOrigins, ...configuredOrigins]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, false);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, origin);
    }

    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

// Routes
const loanRoutes = require('./routes/loans');
const mpesaRoutes = require('./routes/mpesa');
app.use('/api/loans', loanRoutes);
app.use('/api/mpesa', mpesaRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
