import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Eligibility = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idNumber: '',
    monthlyIncome: '',
    loanType: 'Personal'
  });
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPopup(true);
  };

  const handleApplyNow = () => {
    setShowPopup(false);
    navigate('/apply');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, paddingTop: '70px' }}>
      <Header />
      
      <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#1e3a8a', textAlign: 'center', marginBottom: '20px' }}>
            Check Your Loan Eligibility
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#666', textAlign: 'center', marginBottom: '40px' }}>
            You can apply for a loan of Ksh. 2,500 to Ksh. 500,000 directly to your M-PESA.
          </p>
          
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  Enter your Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Mobile Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  Enter your ID number
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  Expected Monthly Income
                </label>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                />
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#1e3a8a', fontWeight: 'bold' }}>
                  Loan Type
                </label>
                <select
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                >
                  <option value="Personal">Personal</option>
                  <option value="Business">Business</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              
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
                Check Eligibility
              </button>
            </form>
          </div>
        </div>
      </section>
      
      {/* Popup Modal */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '15px',
            textAlign: 'center',
            maxWidth: '400px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
            <h3 style={{ color: '#10b981', fontSize: '1.8rem', marginBottom: '15px' }}>Congratulations!</h3>
            <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
              You qualify for a loan up to Ksh 500,000. Start your application now to get funds in minutes.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Close
              </button>
              <button
                onClick={handleApplyNow}
                style={{
                  padding: '12px 25px',
                  backgroundColor: '#1e3a8a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Eligibility;