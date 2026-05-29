import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .site-header-inner {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) auto !important;
            align-items: center !important;
            gap: 12px !important;
          }
          .brand-link {
            min-width: 0;
            width: 100%;
          }
          .brand-title {
            font-size: 1.2rem !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .desktop-nav { display: none !important; }
          .mobile-menu-btn {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            margin: 0 !important;
            justify-self: end !important;
            align-self: center !important;
          }
          .mobile-nav {
            display: ${isMenuOpen ? 'block' : 'none'} !important;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: rgba(30, 58, 138, 0.95);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
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
      <header style={{ 
        backgroundColor: 'rgba(30, 58, 138, 0.9)', 
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)',
        color: 'white', 
        padding: '10px 0', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
      }}>
        <div className="site-header-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <Link to="/" className="brand-link" style={{ color: 'white', textDecoration: 'none' }}>
            <h1 className="brand-title" style={{ fontSize: '1.8rem', margin: 0 }}>Loanvia</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <Link to="/" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>Home</Link>
            <Link to="/eligibility" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>Eligibility</Link>
            <Link to="/apply" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>Apply Now</Link>
            <Link to="/faq" style={{ color: 'white', textDecoration: 'none', margin: '0 15px' }}>FAQ</Link>
            <a href={process.env.REACT_APP_ADMIN_URL || 'http://localhost:3001'} target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24', textDecoration: 'none', margin: '0 15px', fontWeight: 'bold' }}>Admin Portal</a>
          </nav>
          
          {/* Mobile Hamburger Button */}
          <button 
            className="mobile-menu-btn"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
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
            <a href={process.env.REACT_APP_ADMIN_URL || 'http://localhost:3001'} target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24', textDecoration: 'none', display: 'block', padding: '10px 0', fontWeight: 'bold' }} onClick={() => setIsMenuOpen(false)}>Admin Portal</a>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
