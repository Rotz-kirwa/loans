const express = require('express');
const router = express.Router();
const db = require('../db/db');
const {
  formatMpesaError,
  initiateStkPush,
  isMpesaConfigurationError,
  normalizePhoneNumber,
  parseCallbackMetadata,
  parseTransactionDate,
  queryStkStatus,
} = require('../services/mpesa');

const getLoanById = (loanId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM loans WHERE id = ?', [loanId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row || null);
    });
  });
};

const getLoanByCheckoutRequestId = (checkoutRequestId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM loans WHERE mpesa_checkout_request_id = ? ORDER BY id DESC LIMIT 1',
      [checkoutRequestId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row || null);
      }
    );
  });
};

const getLoanByMerchantRequestId = (merchantRequestId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM loans WHERE mpesa_merchant_request_id = ? ORDER BY id DESC LIMIT 1',
      [merchantRequestId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row || null);
      }
    );
  });
};

const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });
};

const toPaymentSnapshot = (loan) => {
  return {
    loanId: loan.id,
    paymentStatus: loan.payment_status || 'not_initiated',
    status: loan.status || 'application_submitted',
    paidAmount: Number(loan.paid_amount || 0),
    requestedAmount: Number(loan.payment_requested_amount || 0),
    mpesaPhone: loan.mpesa_phone || loan.phone || null,
    mpesaReceiptNumber: loan.mpesa_receipt_number || null,
    checkoutRequestID: loan.mpesa_checkout_request_id || null,
    merchantRequestID: loan.mpesa_merchant_request_id || null,
    resultCode: loan.mpesa_result_code || null,
    resultDescription: loan.mpesa_result_desc || null,
    paymentReceivedAt: loan.payment_received_at || null,
    paymentRequestedAt: loan.mpesa_requested_at || null,
    transactionDate: loan.mpesa_transaction_date || null,
  };
};

const updateLoanPaymentRecord = async (loanId, updateFields) => {
  const fieldEntries = Object.entries(updateFields);
  const assignments = fieldEntries.map(([field]) => `${field} = ?`).join(', ');
  const values = fieldEntries.map(([, value]) => value);

  await runQuery(
    `UPDATE loans SET ${assignments} WHERE id = ?`,
    [...values, loanId]
  );
};

const syncPendingLoanFromQuery = async (loan) => {
  if (loan.payment_status !== 'pending' || !loan.mpesa_checkout_request_id) {
    return loan;
  }

  const queryResponse = await queryStkStatus({
    checkoutRequestId: loan.mpesa_checkout_request_id,
  });

  const resultCode = queryResponse.ResultCode != null ? `${queryResponse.ResultCode}` : null;
  const resultDescription =
    queryResponse.ResultDesc ||
    queryResponse.ResponseDescription ||
    loan.mpesa_result_desc ||
    'Waiting for M-PESA confirmation.';

  if (queryResponse.ResponseCode !== '0' && resultCode == null) {
    return loan;
  }

  if (resultCode === '0') {
    await updateLoanPaymentRecord(loan.id, {
      payment_status: 'paid',
      status: 'under_review',
      paid_amount: Number(loan.payment_requested_amount || 0),
      payment_received_at: loan.payment_received_at || new Date().toISOString(),
      mpesa_result_code: resultCode,
      mpesa_result_desc: resultDescription,
    });
  } else if (resultCode && resultCode !== '1037') {
    await updateLoanPaymentRecord(loan.id, {
      payment_status: 'failed',
      status: 'payment_failed',
      mpesa_result_code: resultCode,
      mpesa_result_desc: resultDescription,
    });
  } else if (resultCode) {
    await updateLoanPaymentRecord(loan.id, {
      mpesa_result_code: resultCode,
      mpesa_result_desc: resultDescription,
    });
  }

  return getLoanById(loan.id);
};

router.post('/stkpush', async (req, res) => {
  const loanId = Number(req.body.loanId);
  const amount = Number(req.body.amount);
  const rawPhone = req.body.phone;

  if (!Number.isInteger(loanId) || loanId <= 0) {
    return res.status(400).json({ success: false, message: 'A valid loan ID is required.' });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'A valid payment amount is required.' });
  }

  try {
    const loan = await getLoanById(loanId);

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan application not found.' });
    }

    if (loan.payment_status === 'paid') {
      return res.status(409).json({ success: false, message: 'This loan application has already been paid.' });
    }

    if (loan.payment_status === 'pending' && loan.mpesa_checkout_request_id) {
      return res.status(409).json({
        success: false,
        message: 'A payment request is already pending. Complete the prompt on your phone or wait for confirmation.',
      });
    }

    const phoneNumber = normalizePhoneNumber(rawPhone || loan.mpesa_phone || loan.phone);
    const response = await initiateStkPush({
      phoneNumber,
      amount,
      accountReference: `Loan ${loanId}`,
      transactionDesc: `Loan Processing Fee ${loanId}`,
    });

    if (response.ResponseCode !== '0') {
      throw new Error(response.ResponseDescription || response.CustomerMessage || 'STK push was not accepted by M-PESA.');
    }

    await updateLoanPaymentRecord(loanId, {
      mpesa_phone: phoneNumber,
      payment_status: 'pending',
      status: 'payment_pending',
      payment_requested_amount: amount,
      mpesa_checkout_request_id: response.CheckoutRequestID || null,
      mpesa_merchant_request_id: response.MerchantRequestID || null,
      mpesa_result_code: response.ResponseCode || null,
      mpesa_result_desc: response.ResponseDescription || response.CustomerMessage || 'STK push request accepted.',
      mpesa_requested_at: new Date().toISOString(),
      mpesa_receipt_number: null,
      payment_received_at: null,
      paid_amount: 0,
    });

    return res.json({
      success: true,
      loanId,
      paymentStatus: 'pending',
      checkoutRequestID: response.CheckoutRequestID || null,
      merchantRequestID: response.MerchantRequestID || null,
      customerMessage: response.CustomerMessage || 'STK push sent successfully.',
      responseDescription: response.ResponseDescription || null,
    });
  } catch (error) {
    const message = formatMpesaError(error);
    const isConfigError = isMpesaConfigurationError(error);

    if (!isConfigError && Number.isInteger(loanId) && loanId > 0) {
      try {
        await updateLoanPaymentRecord(loanId, {
          payment_status: 'failed',
          status: 'payment_failed',
          payment_requested_amount: Number.isFinite(amount) ? amount : 0,
          mpesa_result_desc: message,
        });
      } catch (dbError) {
        console.error('Failed to persist STK error:', dbError.message);
      }
    }

    return res.status(isConfigError ? 400 : 502).json({
      success: false,
      message,
      error: error.response?.data || error.message,
    });
  }
});

router.get('/loan/:loanId/status', async (req, res) => {
  const loanId = Number(req.params.loanId);

  if (!Number.isInteger(loanId) || loanId <= 0) {
    return res.status(400).json({ success: false, message: 'A valid loan ID is required.' });
  }

  try {
    let loan = await getLoanById(loanId);

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan application not found.' });
    }

    if ((req.query.refresh === 'true' || req.query.refresh === '1') && loan.payment_status === 'pending') {
      try {
        loan = await syncPendingLoanFromQuery(loan);
      } catch (error) {
        console.error('Failed to refresh STK status:', formatMpesaError(error));
      }
    }

    return res.json({
      success: true,
      ...toPaymentSnapshot(loan),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to load payment status right now.',
      error: error.message,
    });
  }
});

router.post('/callback', async (req, res) => {
  const stkCallback = req.body?.Body?.stkCallback;

  if (!stkCallback) {
    return res.status(400).json({ ResultCode: 1, ResultDesc: 'Invalid callback payload.' });
  }

  const merchantRequestId = stkCallback.MerchantRequestID || null;
  const checkoutRequestId = stkCallback.CheckoutRequestID || null;
  const resultCode = stkCallback.ResultCode != null ? `${stkCallback.ResultCode}` : null;
  const resultDescription = stkCallback.ResultDesc || 'No result description returned.';
  const metadata = parseCallbackMetadata(stkCallback.CallbackMetadata);
  const paidAmount = Number(metadata.Amount || 0);
  const receiptNumber = metadata.MpesaReceiptNumber || null;
  const transactionDate = parseTransactionDate(metadata.TransactionDate);

  let mpesaPhone = null;

  try {
    if (metadata.PhoneNumber) {
      mpesaPhone = normalizePhoneNumber(metadata.PhoneNumber);
    }
  } catch (error) {
    mpesaPhone = `${metadata.PhoneNumber || ''}`.trim() || null;
  }

  try {
    let loan = null;

    if (checkoutRequestId) {
      loan = await getLoanByCheckoutRequestId(checkoutRequestId);
    }

    if (!loan && merchantRequestId) {
      loan = await getLoanByMerchantRequestId(merchantRequestId);
    }

    if (!loan) {
      console.warn('M-PESA callback received for an unknown request:', {
        checkoutRequestId,
        merchantRequestId,
      });

      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (resultCode === '0') {
      await updateLoanPaymentRecord(loan.id, {
        payment_status: 'paid',
        status: 'under_review',
        paid_amount: paidAmount || Number(loan.payment_requested_amount || 0),
        payment_received_at: new Date().toISOString(),
        mpesa_phone: mpesaPhone || loan.mpesa_phone || loan.phone,
        mpesa_receipt_number: receiptNumber,
        mpesa_result_code: resultCode,
        mpesa_result_desc: resultDescription,
        mpesa_transaction_date: transactionDate,
        mpesa_callback_payload: JSON.stringify(req.body),
        mpesa_checkout_request_id: checkoutRequestId || loan.mpesa_checkout_request_id,
        mpesa_merchant_request_id: merchantRequestId || loan.mpesa_merchant_request_id,
      });
    } else {
      await updateLoanPaymentRecord(loan.id, {
        payment_status: 'failed',
        status: 'payment_failed',
        mpesa_result_code: resultCode,
        mpesa_result_desc: resultDescription,
        mpesa_transaction_date: transactionDate,
        mpesa_callback_payload: JSON.stringify(req.body),
        mpesa_checkout_request_id: checkoutRequestId || loan.mpesa_checkout_request_id,
        mpesa_merchant_request_id: merchantRequestId || loan.mpesa_merchant_request_id,
      });
    }

    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Failed to process M-PESA callback:', error.message);
    return res.status(500).json({ ResultCode: 1, ResultDesc: 'Unable to process callback.' });
  }
});

module.exports = router;
