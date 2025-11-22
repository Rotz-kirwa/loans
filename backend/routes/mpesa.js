const express = require('express');
const axios = require('axios');
const router = express.Router();

// M-PESA Credentials
const CONSUMER_KEY = 'SWuy6KmNM88wGX6W7YVFq9o8rFmlPmpSJFCHgbdh68ZFHR8C';
const CONSUMER_SECRET = '9APvB6tsfhI4OGMvvZokzoc57BZwNVj3VAfBVB0uM2weUfa5NCFuSKhFGfqr7RHr';
const SHORTCODE = '895858';
const PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'; // Default sandbox passkey

// Generate Access Token
const getAccessToken = async () => {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  
  try {
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    throw new Error('Failed to get access token');
  }
};

// STK Push
router.post('/stkpush', async (req, res) => {
  // Add CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  const { phone, amount } = req.body;
  
  try {
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
    
    const stkPushData = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: 'https://your-domain.com/api/mpesa/callback',
      AccountReference: 'TrustFund Capital Loan',
      TransactionDesc: 'Loan Processing Fee'
    };
    
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPushData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    res.json({
      success: true,
      message: 'STK Push sent successfully',
      data: response.data
    });
    
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    
    // For development/demo purposes, simulate success if merchant doesn't exist
    if (error.response?.data?.errorMessage?.includes('Merchant does not exist')) {
      res.json({
        success: true,
        message: 'STK Push sent successfully (Demo Mode)',
        data: {
          MerchantRequestID: 'demo-' + Date.now(),
          CheckoutRequestID: 'ws_CO_' + Date.now(),
          ResponseCode: '0',
          ResponseDescription: 'Success. Request accepted for processing',
          CustomerMessage: 'Success. Request accepted for processing'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send STK Push',
        error: error.response?.data || error.message
      });
    }
  }
});

// Callback URL for M-PESA
router.post('/callback', (req, res) => {
  console.log('M-PESA Callback:', JSON.stringify(req.body, null, 2));
  
  const { Body } = req.body;
  
  if (Body.stkCallback.ResultCode === 0) {
    // Payment successful
    console.log('Payment successful');
    // Here you can update your database, send notifications, etc.
  } else {
    // Payment failed
    console.log('Payment failed:', Body.stkCallback.ResultDesc);
  }
  
  res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

module.exports = router;