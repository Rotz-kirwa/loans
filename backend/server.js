const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
const loanRoutes = require('./routes/loans');
const mpesaRoutes = require('./routes/mpesa');
app.use('/api/loans', loanRoutes);
app.use('/api/mpesa', mpesaRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
