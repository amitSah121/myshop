import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function FloatingRiderButton() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show on rider/admin pages or if already at rider pages
  if (
    location.pathname.includes('/rider') || 
    location.pathname.includes('/admin')
  ) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <button 
      style={styles.fab}
      onClick={() => navigate('/rider/register')}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      title="Become a Delivery Rider"
    >
      <div style={styles.content}>
        <span style={styles.icon}>🚴</span>
        <span style={styles.text}>Join as Rider</span>
      </div>
    </button>
  );
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: '8rem',
    right: '2rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '50px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.9375rem',
    fontWeight: '600',
    letterSpacing: '0.3px'
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  icon: {
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center'
  },
  text: {
    whiteSpace: 'nowrap'
  }
};

export default FloatingRiderButton;
