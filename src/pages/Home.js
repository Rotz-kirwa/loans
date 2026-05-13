import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const Home = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, paddingTop: '70px' }}>
      <style>{`
        .hero-apply-link,
        .cta-apply-link {
          display: inline-block;
        }
        .hero-apply-btn,
        .cta-apply-btn {
          position: relative;
          overflow: hidden;
          border: none;
          color: #1e3a8a;
          background: linear-gradient(135deg, #fde047 0%, #fbbf24 45%, #f59e0b 100%);
          font-weight: bold;
          border-radius: 18px;
          cursor: pointer;
          box-shadow: 0 18px 40px rgba(245, 158, 11, 0.34);
          transform: translateY(0);
          transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
          animation: ctaPulse 1.8s ease-in-out infinite;
        }
        .hero-apply-btn {
          padding: 14px 28px;
          font-size: 1.05rem;
        }
        .cta-apply-btn {
          padding: 16px 28px;
          font-size: 1.05rem;
        }
        .hero-apply-btn::before,
        .cta-apply-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 15%, rgba(255,255,255,0.42) 50%, transparent 85%);
          transform: translateX(-135%);
          animation: ctaShine 2.8s linear infinite;
        }
        .hero-apply-btn:hover,
        .cta-apply-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 22px 44px rgba(245, 158, 11, 0.42);
          filter: saturate(1.08);
        }
        .cta-button-content {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .cta-button-label {
          letter-spacing: 0.01em;
        }
        .cta-button-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: rgba(30, 58, 138, 0.12);
          font-size: 1.2rem;
          font-weight: 900;
          animation: ctaArrowNudge 1.2s ease-in-out infinite;
        }
        .cta-button-sparkle {
          position: absolute;
          top: 8px;
          right: 14px;
          z-index: 1;
          color: rgba(255, 255, 255, 0.92);
          font-size: 0.95rem;
          text-shadow: 0 0 16px rgba(255,255,255,0.7);
          animation: ctaTwinkle 1s ease-in-out infinite alternate;
        }
        @keyframes ctaPulse {
          0%, 100% {
            box-shadow: 0 18px 40px rgba(245, 158, 11, 0.34);
          }
          50% {
            box-shadow: 0 22px 48px rgba(245, 158, 11, 0.5);
          }
        }
        @keyframes ctaShine {
          0% {
            transform: translateX(-135%);
          }
          100% {
            transform: translateX(135%);
          }
        }
        @keyframes ctaArrowNudge {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(5px);
          }
        }
        @keyframes ctaTwinkle {
          0% {
            opacity: 0.35;
            transform: scale(0.8) rotate(-12deg);
          }
          100% {
            opacity: 1;
            transform: scale(1.15) rotate(8deg);
          }
        }
        .hero-section {
          background-image: url('/hero-bg.webp');
          background-position: center top !important;
          background-size: cover;
          height: auto !important;
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(255,255,255,0) 80%, rgba(248, 250, 252, 1) 100%);
          pointer-events: none;
        }
        .hero-title, .hero-subtitle { display: none; }
        @media (max-width: 1200px) {
          .hero-section {
            min-height: 420px !important;
            background-position: 10% top !important;
          }
          .hero-overlay {
            background: linear-gradient(to bottom, rgba(255,255,255,0) 50%, rgba(248, 250, 252, 1) 100%) !important;
          }
          .hero-cta-container {
            margin: 0 !important;
            width: 100%;
            display: flex;
            justify-content: flex-end;
            margin-top: 0 !important;
          }
          .hero-glass-card {
            padding: 30px 20px;
            width: 100%;
            margin: 0 !important;
            background: rgba(255, 255, 255, 0.85);
            border-radius: 24px;
          }
          .hero-title {
            font-size: 2.2rem !important;
          }
          .hero-subtitle {
            font-size: 1.1rem !important;
            margin-bottom: 30px !important;
          }
          .hero-apply-btn {
            width: 100% !important;
          }
          .cta-button-content {
            width: 100%;
            justify-content: center;
          }
          .cta-button-arrow {
            width: 34px;
            height: 34px;
          }
          .features-section {
            padding: 50px 15px !important;
          }
          .features-section h3 {
            font-size: 1.8rem !important;
            margin-bottom: 40px !important;
          }
          .feature-card {
            margin: 15px 0 !important;
            padding: 25px 20px !important;
          }
          .feature-icon {
            width: 60px !important;
            height: 60px !important;
            font-size: 2.5rem !important;
          }
          .feature-title {
            font-size: 1.2rem !important;
          }
          .cta-section {
            padding: 40px 15px !important;
          }
          .cta-section h3 {
            font-size: 1.5rem !important;
          }
          .cta-section p {
            font-size: 1rem !important;
          }
          .footer {
            padding: 30px 15px 15px !important;
          }
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            text-align: center !important;
          }
          .footer h3, .footer h4 {
            font-size: 1.1rem !important;
          }
          .social-icons {
            justify-content: center !important;
          }
          .bottom-bar {
            flex-direction: column !important;
            text-align: center !important;
            gap: 10px !important;
          }
          .bottom-bar p {
            font-size: 0.8rem !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-apply-btn,
          .cta-apply-btn,
          .hero-apply-btn::before,
          .cta-apply-btn::before,
          .cta-button-arrow,
          .cta-button-sparkle {
            animation: none !important;
          }
        }
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08) !important;
          border-color: #fbbf24 !important;
        }
      `}</style>
      <Header />
      
      <section className="hero-section">
        <div className="hero-overlay" />
        <Link to="/apply" style={{ position: 'absolute', inset: 0, zIndex: 2 }} aria-label="Apply for a Loan Now" />
      </section>

      {/* Modern CTA Bar */}
      <div style={{ backgroundColor: '#1e3a8a', padding: '20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10 }}>
        <Link to="/apply" className="hero-apply-link">
          <button className="hero-apply-btn" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
            <span className="cta-button-sparkle" aria-hidden="true">✦</span>
            <span className="cta-button-content">
              <span className="cta-button-label">Get Started & Apply for Loan Now</span>
              <span className="cta-button-arrow" aria-hidden="true">→</span>
            </span>
          </button>
        </Link>
      </div>

      {/* Features Section */}
      <section className="features-section" style={{ padding: '80px 20px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ textAlign: 'center', fontSize: '2.5rem', color: '#1e3a8a', marginBottom: '60px', fontWeight: 'bold' }}>
            Why Choose Loanvia?
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div className="feature-card" style={{ 
              textAlign: 'center', 
              padding: '40px 30px', 
              backgroundColor: 'white', 
              borderRadius: '15px', 
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              border: '1px solid #e2e8f0'
            }}>
              <div className="feature-icon" style={{ 
                fontSize: '4rem', 
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>⚡</div>
              <h4 className="feature-title" style={{ color: '#1e3a8a', marginBottom: '15px', fontSize: '1.4rem', fontWeight: 'bold' }}>Fast Approval</h4>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '1rem' }}>Get approved within minutes with our streamlined process and instant decision technology</p>
            </div>
            <div className="feature-card" style={{ 
              textAlign: 'center', 
              padding: '40px 30px', 
              backgroundColor: 'white', 
              borderRadius: '15px', 
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              border: '1px solid #e2e8f0'
            }}>
              <div className="feature-icon" style={{ 
                fontSize: '4rem', 
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>🔒</div>
              <h4 className="feature-title" style={{ color: '#1e3a8a', marginBottom: '15px', fontSize: '1.4rem', fontWeight: 'bold' }}>Secure Process</h4>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '1rem' }}>Your information is protected with bank-level security and advanced encryption technology</p>
            </div>
            <div className="feature-card" style={{ 
              textAlign: 'center', 
              padding: '40px 30px', 
              backgroundColor: 'white', 
              borderRadius: '15px', 
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              border: '1px solid #e2e8f0'
            }}>
              <div className="feature-icon" style={{ 
                fontSize: '4rem', 
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>💰</div>
              <h4 className="feature-title" style={{ color: '#1e3a8a', marginBottom: '15px', fontSize: '1.4rem', fontWeight: 'bold' }}>Best Rates</h4>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '1rem' }}>Competitive interest rates and flexible repayment terms tailored to your financial needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '50px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '2rem', marginBottom: '20px' }}>Ready to Apply?</h3>
          <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
            Start your loan application today and get the funds you need
          </p>
          <Link to="/apply" className="cta-apply-link">
            <button className="cta-apply-btn">
              <span className="cta-button-sparkle" aria-hidden="true">✦</span>
              <span className="cta-button-content">
                <span className="cta-button-label">Apply Now</span>
                <span className="cta-button-arrow" aria-hidden="true">→</span>
              </span>
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '40px 20px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', marginBottom: '25px' }}>
            
            {/* Company Info */}
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '15px', color: '#fbbf24' }}>Loanvia</h3>
              <p style={{ lineHeight: '1.5', marginBottom: '15px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                Fast, secure loan solutions. Licensed and regulated.
              </p>
              <div className="social-icons" style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#1877f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#1da1f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </div>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#0077b5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </div>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#25d366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.488"/></svg>
                </div>
              </div>
            </div>
            
            {/* Services */}
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#fbbf24' }}>Our Services</h4>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>
                <li style={{ color: '#cbd5e1', cursor: 'pointer' }}>Personal Loans</li>
                <li style={{ color: '#cbd5e1', cursor: 'pointer' }}>Business Loans</li>
                <li style={{ color: '#cbd5e1', cursor: 'pointer' }}>Emergency Funding</li>
                <li style={{ color: '#cbd5e1', cursor: 'pointer' }}>Debt Consolidation</li>
                <li style={{ color: '#cbd5e1', cursor: 'pointer' }}>Credit Building</li>
              </ul>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#fbbf24' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>
                <li style={{ color: '#cbd5e1', cursor: 'pointer' }}>Apply Now</li>
                <li style={{ color: '#cbd5e1', cursor: 'pointer' }}>Check Eligibility</li>
                <li style={{ color: '#cbd5e1', cursor: 'pointer' }}>FAQ</li>
                <li style={{ color: '#cbd5e1', cursor: 'pointer' }}>Privacy Policy</li>
                <li style={{ color: '#cbd5e1', cursor: 'pointer' }}>Terms of Service</li>
              </ul>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#fbbf24' }}>Contact Us</h4>
              <div style={{ lineHeight: '1.6', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <p style={{ marginBottom: '10px' }}>📞 +254 700 123 456</p>
                <p style={{ marginBottom: '10px' }}>📧 support@loanvia.co.ke</p>
                <p style={{ marginBottom: '10px' }}>🏢 Westlands Square, 2nd Floor</p>
                <p style={{ marginBottom: '10px' }}>Nairobi, Kenya 00100</p>
                <p style={{ marginBottom: '10px' }}>⏰ Mon-Fri: 8AM-6PM EAT</p>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="bottom-bar" style={{ borderTop: '1px solid #374151', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <p style={{ margin: 0, color: '#9ca3af' }}>
              © 2025 Loanvia. All rights reserved. | Licensed Lender NMLS #123456
            </p>
            <div style={{ display: 'flex', gap: '20px', color: '#9ca3af', fontSize: '0.9rem' }}>
              <span style={{ cursor: 'pointer' }}>Privacy</span>
              <span style={{ cursor: 'pointer' }}>Terms</span>
              <span style={{ cursor: 'pointer' }}>Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
