import { useNavigate } from 'react-router-dom';

function Footer() {
  const navigate = useNavigate();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Main Footer Content */}
        <div style={styles.grid}>
          {/* Company Info */}
          <div style={styles.column}>
            <h3 style={styles.heading}>EverestMart</h3>
            <p style={styles.text}>Your trusted premium grocery destination</p>
            <p style={styles.text}>📧 support@everestmart.com</p>
            <p style={styles.text}>📞 +91 1800-123-4567</p>
          </div>

          {/* Quick Links */}
          <div style={styles.column}>
            <h4 style={styles.subheading}>Quick Links</h4>
            <ul style={styles.list}>
              <li>
                <button onClick={() => navigate('/')} style={styles.link}>
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/products')} style={styles.link}>
                  Products
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/orders')} style={styles.link}>
                  My Orders
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/wishlist')} style={styles.link}>
                  Wishlist
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div style={styles.column}>
            <h4 style={styles.subheading}>Customer Service</h4>
            <ul style={styles.list}>
              <li>
                <button onClick={() => navigate('/help')} style={styles.link}>
                  Help Center
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/orders')} style={styles.link}>
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/addresses')} style={styles.link}>
                  Manage Addresses
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} style={styles.link}>
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* ✅ Partner Links - Rider Only */}
          <div style={styles.column}>
            <h4 style={styles.subheading}>Join Us</h4>
            <ul style={styles.list}>
              <li>
                <button 
                  onClick={() => navigate('/rider/register')}
                  style={styles.partnerLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  🚴 Become a Rider
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/rider/login')}
                  style={styles.link}
                >
                  🔐 Rider Login
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} style={styles.link}>
                  📖 About Us
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/careers')} style={styles.link}>
                  💼 Careers
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={styles.bottom}>
          <p style={styles.copyright}>
            © 2025 EverestMart. All rights reserved.
          </p>
          <div style={styles.social}>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.socialLink}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              Facebook
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.socialLink}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              Twitter
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.socialLink}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              Instagram
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.socialLink}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: '#2C3E50',
    color: 'white',
    marginTop: '4rem',
    padding: '3rem 0 1rem'
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem'
  },
  column: {
    display: 'flex',
    flexDirection: 'column'
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: 'white'
  },
  subheading: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: 'white'
  },
  text: {
    fontSize: '0.9rem',
    opacity: 0.8,
    lineHeight: '1.8',
    margin: '0.25rem 0'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.9rem',
    opacity: 0.8,
    display: 'block',
    padding: '0.5rem 0',
    transition: 'all 0.2s',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    width: '100%'
  },
  partnerLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    opacity: 0.8,
    display: 'block',
    padding: '0.6rem 0',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    width: '100%'
  },
  bottom: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  copyright: {
    fontSize: '0.875rem',
    opacity: 0.7,
    margin: 0
  },
  social: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap'
  },
  socialLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.875rem',
    opacity: 0.7,
    transition: 'opacity 0.2s'
  }
};

export default Footer;
