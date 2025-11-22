import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '15px 0', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>TrustFund Capital</h1>
        </Link>
        <nav>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>Home</Link>
          <Link to="/eligibility" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>Eligibility</Link>
          <Link to="/apply" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>Apply Now</Link>
          <Link to="/faq" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>FAQ</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;