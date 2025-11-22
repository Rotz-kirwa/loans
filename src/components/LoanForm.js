import React, { useState } from 'react';
import API from '../api';

const LoanForm = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('');
  const [interest, setInterest] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/loans', {
        name,
        phone,
        amount: parseFloat(amount),
        term_days: parseInt(term),
        interest: parseFloat(interest),
      });
      setMessage(res.data.message);
      setName('');
      setPhone('');
      setAmount('');
      setTerm('');
      setInterest('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2>Apply for a Loan</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />
        <input
          type="number"
          placeholder="Loan Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />
        <input
          type="number"
          placeholder="Term (days)"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />
        <input
          type="number"
          placeholder="Interest %"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
          Submit Loan
        </button>
      </form>
      {message && <p style={{ marginTop: '20px', color: 'green' }}>{message}</p>}
    </div>
  );
};

export default LoanForm;
