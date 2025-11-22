import React, { useState } from 'react';
import Header from '../components/Header';

const FAQ = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      question: "How quickly can I get approved?",
      answer: "Most applications are approved within 15 minutes during business hours. You'll receive an instant decision in most cases."
    },
    {
      question: "What are the interest rates?",
      answer: "Our interest rate is 5% per month on all loans regardless of the amount or duration."
    },
    {
      question: "How much can I borrow?",
      answer: "You can borrow between $1,000 and $15,000 depending on your income and creditworthiness."
    },
    {
      question: "What documents do I need?",
      answer: "You'll need a valid ID, proof of income (pay stubs or bank statements), and bank account information."
    },
    {
      question: "How do I receive the money?",
      answer: "Once approved, funds are typically deposited directly into your bank account within 1-2 business days."
    },
    {
      question: "Can I pay off my loan early?",
      answer: "Yes, you can pay off your loan early without any prepayment penalties."
    },
    {
      question: "What if I have bad credit?",
      answer: "We work with borrowers of all credit types. While good credit helps, we consider other factors like income and employment history."
    },
    {
      question: "Is my information secure?",
      answer: "Yes, we use bank-level encryption and security measures to protect all your personal and financial information."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
      <Header />
      
      <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#1e3a8a', textAlign: 'center', marginBottom: '40px' }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {faqs.map((faq, index) => (
              <div key={index} style={{ borderBottom: index < faqs.length - 1 ? '1px solid #eee' : 'none' }}>
                <button
                  onClick={() => toggleFAQ(index)}
                  style={{
                    width: '100%',
                    padding: '20px',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#1e3a8a',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {faq.question}
                  <span style={{ fontSize: '1.2rem' }}>
                    {openFAQ === index ? '▲' : '▼'}
                  </span>
                </button>
                {openFAQ === index && (
                  <div style={{ padding: '0 20px 20px', color: '#666', lineHeight: '1.6' }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Still have questions? Contact our support team
            </p>
            <p style={{ fontSize: '1.2rem', color: '#1e3a8a', fontWeight: 'bold' }}>
              📞 +254 700 123 456
            </p>
            <p style={{ color: '#666' }}>
              📧 support@trustfundcapital.co.ke
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;