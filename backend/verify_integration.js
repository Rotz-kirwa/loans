const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

async function runIntegrationTest() {
  console.log('🔄 Starting end-to-end integration test...');

  try {
    // 1. Submit loan application (Main Site -> Backend)
    console.log('\n1. Submitting loan application from main site...');
    const applyRes = await axios.post('http://localhost:5000/api/loans', {
      firstName: 'Integration',
      lastName: 'Tester',
      idNumber: '12345678',
      phone: '0700000000',
      loanAmount: '5000',
      income: '20000',
      employment: 'Employed',
      loanTerm: '1',
      interest: '500',
      totalAmount: '5500'
    });
    
    const loanId = applyRes.data.loan.id;
    console.log(`✅ Loan application submitted successfully. Assigned Loan ID: ${loanId}`);

    // 2. Inject mock STK CheckoutRequestID (so we don't need a real STK Push to succeed)
    console.log('\n2. Injecting mock STK Push request into database...');
    const db = new sqlite3.Database('./fintrust.db');
    const mockCheckoutId = `ws_CO_${Date.now()}`;
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE loans SET mpesa_checkout_request_id = ?, payment_status = 'pending', mpesa_requested_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [mockCheckoutId, loanId],
        (err) => err ? reject(err) : resolve()
      );
    });
    console.log(`✅ Mock CheckoutRequestID injected: ${mockCheckoutId}`);

    // 3. Simulate M-Pesa Callback (Safaricom -> Backend)
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
              { Name: "MpesaReceiptNumber", Value: "NLJ7RT61SV" },
              { Name: "Balance" },
              { Name: "TransactionDate", Value: 20241119102430 },
              { Name: "PhoneNumber", Value: 254700000000 }
            ]
          }
        }
      }
    };

    const callbackRes = await axios.post('http://localhost:5000/api/mpesa/callback', callbackPayload);
    console.log('✅ Callback processed by backend.');

    // 4. Verify Admin Dashboard API (Backend -> Admin Site)
    console.log('\n4. Verifying admin dashboard API correctly registers the payment...');
    const adminRes = await axios.get('http://localhost:5000/api/admin/audit-logs', {
      headers: { Authorization: 'Bearer loanvia-admin-secret-token' }
    });

    const recordedLoan = adminRes.data.find(l => l.id === loanId);
    
    if (recordedLoan && recordedLoan.payment_status === 'paid' && recordedLoan.mpesa_receipt_number === 'NLJ7RT61SV') {
      console.log(`✅ SUCCESS! Admin site successfully received the payment record.`);
      console.log(`   - Status: ${recordedLoan.payment_status}`);
      console.log(`   - Receipt: ${recordedLoan.mpesa_receipt_number}`);
      console.log(`   - Paid Amount: ${recordedLoan.paid_amount}`);
    } else {
      console.error('❌ FAILURE: The payment was not properly recorded in the admin site!');
      console.log(recordedLoan);
    }
    
    db.close();

  } catch (error) {
    console.error('❌ Test failed with error:', error.response ? error.response.data : error.message);
  }
}

runIntegrationTest();
