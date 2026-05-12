import { useNavigate } from "react-router-dom";
import "./Home.css";


function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-inner">
          <div className="logo">
            <img src="/OmniGrosslogo2.png" alt="OmniGross" className="logo-img" />
            <span className="logo-text">OmniGross</span>
          </div>
          <div className="nav-actions">
            <button className="btn-ghost" onClick={() => navigate("/login")}>
              Sign In
            </button>
            <button className="btn-primary-nav" onClick={() => navigate("/login")}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-grid-bg" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-badge">GST Compliant · India Ready</div>
          <h1 className="hero-title">
            Professional GST Invoices,<br />
            <span className="hero-highlight">Generated in Seconds</span>
          </h1>
          <p className="hero-sub">
            Automate your billing workflow. Enter details once, get a polished
            PDF invoice — fully GST-compliant, every time.
          </p>
          <div className="hero-cta-group">
            <button className="btn-hero-primary" onClick={() => navigate("/login")}>
              Start for Free
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn-hero-ghost" onClick={() => navigate("/login")}>
              View Sample Invoice
            </button>
          </div>
          <p className="hero-note">No credit card required · Free to start</p>
        </div>

        {/* Floating Invoice Preview Card */}
        <div className="hero-preview" aria-hidden="true">
          <div className="invoice-card">
            <div className="invoice-card-header">
              <div className="invoice-brand">
                <img src="/OmniGrosslogo2.png" alt="" className="invoice-brand-img" />
                OmniGross
              </div>
              <div className="invoice-label">TAX INVOICE</div>
            </div>
            <div className="invoice-divider" />
            <div className="invoice-row">
              <span>Subtotal</span><span>₹12,500.00</span>
            </div>
            <div className="invoice-row">
              <span>CGST (9%)</span><span>₹1,125.00</span>
            </div>
            <div className="invoice-row">
              <span>SGST (9%)</span><span>₹1,125.00</span>
            </div>
            <div className="invoice-divider" />
            <div className="invoice-total">
              <span>Total</span><span>₹14,750.00</span>
            </div>
            <div className="invoice-status">
              <span className="status-dot" />
              Invoice Ready — PDF
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <span className="stat-number">50K+</span>
            <span className="stat-label">Invoices Generated</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">&lt; 5s</span>
            <span className="stat-label">Per Invoice</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">GST</span>
            <span className="stat-label">100% Compliant</span>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="steps-section">
        <div className="section-container">
          <div className="section-label">How It Works</div>
          <h2 className="section-title">Invoice creation in three steps</h2>
          <p className="section-sub">No accounting expertise needed. Just fill in the details and download.</p>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Enter Details</h3>
              <p>Add your customer name, GSTIN, products, quantities, and HSN codes in a clean form.</p>
            </div>

            <div className="step-connector" aria-hidden="true">→</div>

            <div className="step-card step-card--accent">
              <div className="step-number">02</div>
              <div className="step-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Auto Calculate</h3>
              <p>CGST, SGST, IGST, and grand totals are computed instantly — zero manual math.</p>
            </div>

            <div className="step-connector" aria-hidden="true">→</div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Download PDF</h3>
              <p>Get a professionally formatted PDF invoice — ready to send to your client instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need, nothing you don't</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h4>Lightning Fast</h4>
              <p>Generate and download your invoice in under 5 seconds. No loading screens.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="14" y="2" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="2" y="14" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <path d="M18 14v1a5 5 0 0 1-5 5h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M6 10V9a5 5 0 0 1 5-5h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h4>GST Auto-Split</h4>
              <p>Automatically splits CGST/SGST for intra-state or applies IGST for inter-state.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>PDF Download</h4>
              <p>Beautiful, print-ready PDF with your business logo and signature line.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h4>Secure & Private</h4>
              <p>Your data is encrypted at rest and never shared with third parties.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="3" cy="6" r="1" fill="currentColor"/>
                  <circle cx="3" cy="12" r="1" fill="currentColor"/>
                  <circle cx="3" cy="18" r="1" fill="currentColor"/>
                </svg>
              </div>
              <h4>Invoice History</h4>
              <p>Access all past invoices. Search, re-download, or duplicate any entry.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>Multi-Item Support</h4>
              <p>Add multiple line items with different tax rates, discounts, and HSN codes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-section">
        <div className="cta-glow" aria-hidden="true" />
        <div className="cta-content">
          <div className="section-label">Get Started Today</div>
          <h2 className="cta-title">Your first invoice is<br />minutes away</h2>
          <p className="cta-sub">
            Join thousands of Indian businesses simplifying their GST billing.
          </p>
          <button className="btn-cta-primary" onClick={() => navigate("/login")}>
            Create Your First Invoice
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="logo">
            <img src="/OmniGrosslogo2.png" alt="OmniGross" className="logo-img" />
            <span className="logo-text">OmniGross</span>
          </div>
          <p className="footer-copy">© 2025 OmniGross. GST Invoice Generator for Indian Businesses.</p>
        </div>
      </footer>

    </div>
  );
}

export default Home;
