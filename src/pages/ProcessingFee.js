import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import API from '../api';

const ProcessingFee = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [application, setApplication] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('neutral');
  const processingFeeAmount = 100;
  const pollIntervalRef = useRef(null);

  const syncStoredApplication = (nextApplication) => {
    setApplication(nextApplication);
    localStorage.setItem('loanApplication', JSON.stringify(nextApplication));
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setIsPolling(false);
  };

  useEffect(() => {
    const storedApplication = localStorage.getItem('loanApplication');

    if (storedApplication) {
      const parsedApplication = JSON.parse(storedApplication);
      setApplication(parsedApplication);

      if (parsedApplication.mpesaPhone || parsedApplication.phone) {
        setPhoneNumber(parsedApplication.mpesaPhone || parsedApplication.phone);
      }

      if (parsedApplication.paymentStatus === 'paid') {
        setStatusTone('success');
        setStatusMessage('Payment confirmed. Your loan application is under review.');
      } else if (parsedApplication.paymentStatus === 'failed') {
        setStatusTone('error');
        setStatusMessage('The last M-PESA payment attempt did not complete. You can try again.');
      }
    }
  }, []);

  useEffect(() => {
    if (!application?.loanId || application.paymentStatus !== 'pending' || pollIntervalRef.current) {
      return undefined;
    }

    const fetchPaymentStatus = async () => {
      try {
        const response = await API.get(`/mpesa/loan/${application.loanId}/status?refresh=true`);
        const payment = response.data;
        setApplication((currentApplication) => {
          const nextApplication = {
            ...(currentApplication || {}),
            paymentStatus: payment.paymentStatus,
            amountPaid: payment.paidAmount,
            mpesaPhone: payment.mpesaPhone || phoneNumber,
            mpesaReceiptNumber: payment.mpesaReceiptNumber || currentApplication?.mpesaReceiptNumber || '',
            checkoutRequestID: payment.checkoutRequestID || currentApplication?.checkoutRequestID || '',
            merchantRequestID: payment.merchantRequestID || currentApplication?.merchantRequestID || '',
          };

          localStorage.setItem('loanApplication', JSON.stringify(nextApplication));
          return nextApplication;
        });

        if (payment.paymentStatus === 'paid') {
          stopPolling();
          setStatusTone('success');
          setStatusMessage(
            payment.mpesaReceiptNumber
              ? `Payment confirmed. M-PESA receipt ${payment.mpesaReceiptNumber}. Your loan application is now under review.`
              : 'Payment confirmed. Your loan application is now under review.'
          );
          return;
        }

        if (payment.paymentStatus === 'failed') {
          stopPolling();
          setStatusTone('error');
          setStatusMessage(payment.resultDescription || 'The M-PESA payment was not completed. Please try again.');
          return;
        }

        setStatusTone('neutral');
        setStatusMessage(
          payment.resultDescription || 'STK push sent. Complete the M-PESA prompt on your phone and we will confirm automatically.'
        );
      } catch (error) {
        setStatusTone('neutral');
        setStatusMessage('We are still checking M-PESA for confirmation. Complete the prompt on your phone if it is still pending.');
      }
    };

    setIsPolling(true);
    fetchPaymentStatus();
    pollIntervalRef.current = setInterval(fetchPaymentStatus, 5000);

    return () => {
      stopPolling();
    };
  }, [application?.loanId, application?.paymentStatus, phoneNumber]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const handleSTKPush = async (e) => {
    e.preventDefault();
    if (!application?.loanId) {
      setStatusTone('error');
      setStatusMessage('We could not find a submitted loan application. Please complete the application form first.');
      return;
    }

    setIsSubmitting(true);
    setStatusTone('neutral');
    setStatusMessage('Sending the payment request to your phone...');

    try {
      const response = await API.post('/mpesa/stkpush', {
        loanId: application.loanId,
        phone: phoneNumber,
        amount: processingFeeAmount
      });

      const updatedApplication = {
        ...application,
        mpesaPhone: phoneNumber,
        paymentStatus: 'pending',
        amountPaid: 0,
        checkoutRequestID: response.data.checkoutRequestID || '',
        merchantRequestID: response.data.merchantRequestID || ''
      };

      syncStoredApplication(updatedApplication);
      setStatusTone('neutral');
      setStatusMessage(
        response.data.customerMessage ||
          'STK push sent. Complete the M-PESA prompt on your phone and we will confirm automatically.'
      );
    } catch (error) {
      setStatusTone('error');
      setStatusMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'We could not send the M-PESA payment request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, paddingTop: '70px' }}>
      <Header />
      
      <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💳</div>
            
            <h2 style={{ fontSize: '2rem', color: '#1e3a8a', marginBottom: '20px' }}>
              Processing Fee Required
            </h2>

            {application && (
              <div style={{
                marginBottom: '24px',
                padding: '18px 20px',
                borderRadius: '10px',
                backgroundColor: '#eef4ff',
                border: '1px solid #bfdbfe',
                textAlign: 'left'
              }}>
                <p style={{ margin: '0 0 8px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  Application #{application.loanId}
                </p>
                <p style={{ margin: '0 0 6px', color: '#475569' }}>
                  Requested amount: Ksh {Number(application.loanAmount || 0).toLocaleString()}
                </p>
                <p style={{ margin: 0, color: '#475569' }}>
                  Estimated total repayment: Ksh {Number(application.totalAmount || 0).toLocaleString()}
                </p>
              </div>
            )}
            
            <div style={{ 
              backgroundColor: '#fef3c7', 
              border: '2px solid #f59e0b', 
              borderRadius: '8px', 
              padding: '20px', 
              marginBottom: '30px' 
            }}>
              <h3 style={{ color: '#92400e', marginBottom: '15px' }}>Important Notice</h3>
              <p style={{ color: '#92400e', lineHeight: '1.6', margin: 0 }}>
                A processing fee of <strong>Ksh {processingFeeAmount}</strong> is required to complete your loan application. 
                This fee is <strong>fully refundable</strong> after your loan application is processed.
              </p>
            </div>
            
            <div style={{ marginBottom: '30px', textAlign: 'left' }}>
              <h4 style={{ color: '#1e3a8a', marginBottom: '15px' }}>What happens next:</h4>
              <ul style={{ color: '#666', lineHeight: '1.8' }}>
                <li>Pay the Ksh {processingFeeAmount} processing fee via M-PESA</li>
                <li>Your application will be reviewed instantly</li>
                <li>The processing fee will be refunded to your M-PESA</li>
                <li>You'll receive the money via M-PESA in less than 3 minutes</li>
              </ul>
            </div>
            
            <form onSubmit={handleSTKPush}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold', textAlign: 'left' }}>
                  M-PESA Phone Number *
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254700123456"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '2px solid #ddd', 
                    borderRadius: '5px', 
                    fontSize: '1rem',
                    textAlign: 'center'
                  }}
                />
              </div>

              {statusMessage && (
                <div style={{
                  marginBottom: '20px',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  backgroundColor:
                    statusTone === 'success' ? '#ecfdf5' :
                    statusTone === 'error' ? '#fef2f2' :
                    '#eff6ff',
                  border:
                    statusTone === 'success' ? '1px solid #86efac' :
                    statusTone === 'error' ? '1px solid #fca5a5' :
                    '1px solid #93c5fd',
                  color:
                    statusTone === 'success' ? '#166534' :
                    statusTone === 'error' ? '#b91c1c' :
                    '#1d4ed8'
                }}>
                  {statusMessage}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || isPolling || !application?.loanId || application?.paymentStatus === 'paid'}
                style={{ 
                  width: '100%',
                  backgroundColor: (isSubmitting || isPolling || !application?.loanId || application?.paymentStatus === 'paid') ? '#9ca3af' : '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  padding: '15px', 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  borderRadius: '5px', 
                  cursor: (isSubmitting || isPolling || !application?.loanId || application?.paymentStatus === 'paid') ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting
                  ? 'Sending STK Push...'
                  : isPolling
                    ? 'Waiting for M-PESA Confirmation...'
                    : application?.paymentStatus === 'paid'
                      ? 'Payment Confirmed'
                      : `Pay Ksh ${processingFeeAmount} via M-PESA`}
              </button>
            </form>
            
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '20px' }}>
              Secure payment powered by M-PESA
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProcessingFee;
