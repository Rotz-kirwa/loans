import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const ApplyNow = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    phone: '',
    loanAmount: '',
    income: '',
    employment: '',
    loanTerm: ''
  });

  const calculateTotalAmount = () => {
    if (formData.loanAmount && formData.loanTerm) {
      const principal = parseFloat(formData.loanAmount);
      const months = parseInt(formData.loanTerm);
      const monthlyInterest = 0.05; // 5% per month
      const totalInterest = principal * monthlyInterest * months;
      return principal + totalInterest;
    }
    return 0;
  };

  const totalAmount = calculateTotalAmount();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Store form data in localStorage for later use
    localStorage.setItem('loanApplication', JSON.stringify(formData));
    // Navigate to processing fee page
    navigate('/processing-fee');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
      <Header />
      
      <section style={{ 
        padding: '60px 20px', 
        backgroundImage: 'url(https://i.pinimg.com/736x/16/db/e1/16dbe19cb2701486b69d7bab3fbedbe8.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#1e3a8a', textAlign: 'center', marginBottom: '40px' }}>
            Loan Application
          </h2>
          
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  ID Number *
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  Loan Amount *
                </label>
                <select
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                >
                  <option value="">Select Amount</option>
                  <option value="10000">Ksh 10,000</option>
                  <option value="25000">Ksh 25,000</option>
                  <option value="50000">Ksh 50,000</option>
                  <option value="100000">Ksh 100,000</option>
                  <option value="200000">Ksh 200,000</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  Monthly Income *
                </label>
                <input
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  Employment Status *
                </label>
                <select
                  name="employment"
                  value={formData.employment}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                >
                  <option value="">Select Status</option>
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="retired">Retired</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  Loan Term (Months) *
                </label>
                <select
                  name="loanTerm"
                  value={formData.loanTerm}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                >
                  <option value="">Select Term</option>
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                </select>
              </div>
              
              {totalAmount > 0 && (
                <div style={{ 
                  marginBottom: '30px', 
                  padding: '20px', 
                  backgroundColor: '#f0f8ff', 
                  borderRadius: '8px', 
                  border: '2px solid #1e3a8a' 
                }}>
                  <h4 style={{ color: '#1e3a8a', marginBottom: '10px' }}>Loan Calculation</h4>
                  <p style={{ margin: '5px 0', color: '#666' }}>Loan Amount: Ksh {parseInt(formData.loanAmount).toLocaleString()}</p>
                  <p style={{ margin: '5px 0', color: '#666' }}>Interest Rate: 5% per month</p>
                  <p style={{ margin: '5px 0', color: '#666' }}>Loan Term: {formData.loanTerm} month(s)</p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                    Total Amount to Pay: Ksh {totalAmount.toLocaleString()}
                  </p>
                </div>
              )}
              
              <button
                type="submit"
                style={{ 
                  width: '100%',
                  backgroundColor: '#1e3a8a', 
                  color: 'white', 
                  border: 'none', 
                  padding: '15px', 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  borderRadius: '5px', 
                  cursor: 'pointer' 
                }}
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApplyNow;