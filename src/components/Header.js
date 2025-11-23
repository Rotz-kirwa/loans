import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .mobile-nav {
            display: ${isMenuOpen ? 'block' : 'none'} !important;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #1e3a8a;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .mobile-nav a {
            display: block !important;
            padding: 10px 0 !important;
            margin: 0 !important;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-nav { display: none !important; }
          .desktop-nav { margin-left: auto !important; }
        }
      `}</style>
      <header style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '15px 0', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', position: 'relative', gap: '40px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            <h1 style={{ fontSize: '1.8rem', margin: 0 }}>TrustFund Capital</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <Link to="/" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>Home</Link>
            <Link to="/eligibility" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>Eligibility</Link>
            <Link to="/apply" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>Apply Now</Link>
            <Link to="/faq" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>FAQ</Link>
          </nav>
          
          {/* Mobile Hamburger Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ 
              display: 'none',
              background: 'none', 
              border: 'none', 
              color: 'white', 
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
          
          {/* Mobile Navigation */}
          <nav className="mobile-nav">
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/eligibility" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Eligibility</Link>
            <Link to="/apply" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Apply Now</Link>
            <Link to="/faq" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>FAQ</Link>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;