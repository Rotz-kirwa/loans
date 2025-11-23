import React, { useState } from 'react';
import Header from '../components/Header';

const ProcessingFee = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSTKPush = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Demo mode - simulate STK push
    setTimeout(() => {
      alert(`STK Push sent to ${phoneNumber}. Please complete the payment on your phone.`);
      setIsProcessing(false);
      
      // Simulate payment success after 3 seconds
      setTimeout(() => {
        alert('Payment successful! Your loan application is being processed.');
      }, 3000);
    }, 2000);
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
            
            <div style={{ 
              backgroundColor: '#fef3c7', 
              border: '2px solid #f59e0b', 
              borderRadius: '8px', 
              padding: '20px', 
              marginBottom: '30px' 
            }}>
              <h3 style={{ color: '#92400e', marginBottom: '15px' }}>Important Notice</h3>
              <p style={{ color: '#92400e', lineHeight: '1.6', margin: 0 }}>
                A processing fee of <strong>Ksh 100</strong> is required to complete your loan application. 
                This fee is <strong>fully refundable</strong> after your loan application is processed.
              </p>
            </div>
            
            <div style={{ marginBottom: '30px', textAlign: 'left' }}>
              <h4 style={{ color: '#1e3a8a', marginBottom: '15px' }}>What happens next:</h4>
              <ul style={{ color: '#666', lineHeight: '1.8' }}>
                <li>Pay the Ksh 100 processing fee via M-PESA</li>
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
              
              <button
                type="submit"
                disabled={isProcessing}
                style={{ 
                  width: '100%',
                  backgroundColor: isProcessing ? '#9ca3af' : '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  padding: '15px', 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  borderRadius: '5px', 
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'Sending STK Push...' : 'Pay Ksh 100 via M-PESA'}
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