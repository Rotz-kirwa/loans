const express = require('express');
const router = express.Router();
const db = require('../db/db');

const allowedPaymentStatuses = new Set(['not_initiated', 'pending', 'failed']);

// Submit a new loan application
router.post('/', (req, res) => {
  const {
    firstName,
    lastName,
    idNumber,
    phone,
    loanAmount,
    income,
    employment,
    loanTerm,
    totalAmount,
    interestRate
  } = req.body;

  const amount = Number(loanAmount);
  const monthlyIncome = Number(income);
  const loanTermMonths = Number(loanTerm);
  const totalLoanAmount = Number(totalAmount);
  const interest = Number(interestRate ?? 5);

  if (
    !firstName ||
    !lastName ||
    !idNumber ||
    !phone ||
    !employment ||
    Number.isNaN(amount) ||
    Number.isNaN(monthlyIncome) ||
    Number.isNaN(loanTermMonths) ||
    Number.isNaN(totalLoanAmount)
  ) {
    return res.status(400).json({ error: 'Please provide all required loan application fields.' });
  }

  const name = `${firstName} ${lastName}`.trim();
  const term_days = loanTermMonths * 30;
  const due_date = new Date(Date.now() + term_days * 24 * 60 * 60 * 1000).toISOString();

  db.run(
    `INSERT INTO loans (
      name,
      first_name,
      last_name,
      id_number,
      phone,
      amount,
      monthly_income,
      employment_status,
      loan_term_months,
      term_days,
      interest,
      total_amount,
      status,
      payment_status,
      due_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      firstName,
      lastName,
      idNumber,
      phone,
      amount,
      monthlyIncome,
      employment,
      loanTermMonths,
      term_days,
      interest,
      totalLoanAmount,
      'application_submitted',
      'not_initiated',
      due_date
    ],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({
        message: 'Loan application submitted',
        loan: {
          id: this.lastID,
          name,
          firstName,
          lastName,
          idNumber,
          phone,
          amount,
          monthlyIncome,
          employment,
          loanTermMonths,
          interest,
          totalAmount: totalLoanAmount,
          status: 'application_submitted',
          paymentStatus: 'not_initiated',
          dueDate: due_date
        }
      });
    }
  );
});

// Get all loans (for admin)
router.get('/', (req, res) => {
  db.all(
    `SELECT *,
            COALESCE(payment_received_at, mpesa_requested_at, created_at) AS activity_at
     FROM loans
     ORDER BY COALESCE(payment_received_at, mpesa_requested_at, created_at) DESC,
              created_at DESC`,
    [],
    (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
    }
  );
});

// Update payment information for an application
router.patch('/:id/payment', (req, res) => {
  const { id } = req.params;
  const { mpesaPhone, paymentStatus, amountPaid } = req.body;

  if (paymentStatus === 'paid') {
    return res.status(403).json({
      error: 'Paid status is updated automatically from the M-PESA callback and cannot be set manually.',
    });
  }

  if (!allowedPaymentStatuses.has(paymentStatus)) {
    return res.status(400).json({ error: 'Invalid payment status provided.' });
  }

  const paidAmount = Number(amountPaid || 0);
  const paymentReceivedAt = null;

  let applicationStatus = 'payment_pending';
  if (paymentStatus === 'failed') {
    applicationStatus = 'payment_failed';
  }

  db.run(
    `UPDATE loans
      SET mpesa_phone = ?,
          payment_status = ?,
          status = ?,
          paid_amount = ?,
          payment_received_at = ?,
          mpesa_result_code = NULL,
          mpesa_result_desc = NULL,
          mpesa_checkout_request_id = NULL,
          mpesa_merchant_request_id = NULL,
          mpesa_receipt_number = NULL
      WHERE id = ?`,
    [mpesaPhone || null, paymentStatus, applicationStatus, paidAmount, paymentReceivedAt, id],
    function updatePayment(err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Loan application not found.' });
      }

      return res.json({
        message: 'Payment information updated',
        loanId: Number(id),
        paymentStatus,
        status: applicationStatus,
        paidAmount
      });
    }
  );
});

module.exports = router;
