require('dotenv').config({ path: './.env' });
const axios = require('axios');
const { Pool } = require('pg');

async function runIntegrationTest() {
  console.log('🔄 Starting end-to-end integration test with PostgreSQL...');

  const isPostgres = /^postgres(?:ql)?:\/\//i.test(process.env.DATABASE_URL || '');
  if (!isPostgres) {
    console.error('❌ DATABASE_URL is not set to a PostgreSQL connection string!');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('✅ Connected to PostgreSQL database.');
    
    // 1. Submit loan application (Main Site -> Backend)
    console.log('\n1. Submitting loan application from main site...');
    const applyRes = await axios.post('http://localhost:5000/api/loans', {
      firstName: 'Postgres',
      lastName: 'Tester',
      idNumber: '87654321',
      phone: '0711111111',
      loanAmount: '10000',
      income: '40000',
      employment: 'Employed',
      loanTerm: '1',
      interestRate: '5',
      totalAmount: '10500'
    });
    
    const loanId = applyRes.data.loan.id;
    console.log(`✅ Loan application submitted successfully. Assigned Loan ID: ${loanId}`);

    // 2. Inject mock STK CheckoutRequestID
    console.log('\n2. Injecting mock STK Push request into PostgreSQL database...');
    const mockCheckoutId = `ws_CO_${Date.now()}`;
    await pool.query(
      `UPDATE loans SET mpesa_checkout_request_id = $1, payment_status = 'pending', mpesa_requested_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [mockCheckoutId, loanId]
    );
    console.log(`✅ Mock CheckoutRequestID injected: ${mockCheckoutId}`);

    // 3. Simulate M-Pesa Callback
    console.log('\n3. Simulating successful M-Pesa callback from Safaricom...');
    const callbackPayload = {
      Body: {
        stkCallback: {
          MerchantRequestID: "29115-34620561-1",
          CheckoutRequestID: mockCheckoutId,
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully.",
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: 50 },
              { Name: "MpesaReceiptNumber", Value: "POSTGRES7X" },
              { Name: "Balance" },
              { Name: "TransactionDate", Value: 20241119102430 },
              { Name: "PhoneNumber", Value: 254711111111 }
            ]
          }
        }
      }
    };

    await axios.post('http://localhost:5000/api/mpesa/callback', callbackPayload);
    console.log('✅ Callback processed by backend.');

    // 4. Verify Admin Dashboard API
    console.log('\n4. Verifying admin dashboard API correctly registers the payment from Postgres...');
    const adminRes = await axios.get('http://localhost:5000/api/admin/audit-logs', {
      headers: { Authorization: 'Bearer loanvia-admin-secret-token' }
    });

    const recordedLoan = adminRes.data.find(l => l.id === loanId);
    
    if (recordedLoan && recordedLoan.payment_status === 'paid' && recordedLoan.mpesa_receipt_number === 'POSTGRES7X') {
      console.log(`✅ SUCCESS! PostgreSQL tables exist and Admin site successfully received the payment record.`);
      console.log(`   - Status: ${recordedLoan.payment_status}`);
      console.log(`   - Receipt: ${recordedLoan.mpesa_receipt_number}`);
      console.log(`   - Paid Amount: ${recordedLoan.paid_amount}`);
    } else {
      console.error('❌ FAILURE: The payment was not properly recorded in Postgres!');
      console.log(recordedLoan);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.response ? error.response.data : error.message);
  } finally {
    await pool.end();
  }
}

runIntegrationTest();
