import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  
  const hasLoadedWishlist = useRef(false);

  useEffect(() => {
    loadUserAndCart();
    
    window.addEventListener('cartUpdated', loadUserAndCart);
    window.addEventListener('wishlistUpdated', loadWishlistCount);
    window.addEventListener('userUpdated', loadUserAndCart); // ✅ Listen for user updates
    
    return () => {
      window.removeEventListener('cartUpdated', loadUserAndCart);
      window.removeEventListener('wishlistUpdated', loadWishlistCount);
      window.removeEventListener('userUpdated', loadUserAndCart);
    };
  }, []);

  const loadUserAndCart = () => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('👤 User loaded:', parsedUser.name, 'Admin:', parsedUser.isAdmin);
        
        // Only load wishlist once when user is found
        if (!hasLoadedWishlist.current) {
          loadWishlistCount();
          hasLoadedWishlist.current = true;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        setUser(null);
      }
    } else {
      setUser(null);
    }

    // Load cart count from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  };

  const loadWishlistCount = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWishlistCount(data.wishlist?.length || 0);
      }
    } catch (error) {
      console.log('Could not load wishlist count');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    hasLoadedWishlist.current = false;
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
    alert('Logged out successfully!');
    navigate('/');
    window.dispatchEvent(new Event('userUpdated'));
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContainer}>
        {/* Logo & Brand */}
        <div style={styles.brand} onClick={() => navigate('/')}>
          <img 
            src="/assets/logo.jpg" 
            alt="EverestMart" 
            style={styles.navLogo}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <span style={styles.brandName}>EverestMart</span>
        </div>

        {/* Navigation Links */}
        <div style={styles.navLinks}>
          <button 
            style={styles.navBtn} 
            onClick={() => navigate('/')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Home
          </button>

          <button 
            style={styles.navBtn} 
            onClick={() => navigate('/products')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
              <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Products
          </button>

          <button 
            style={styles.navBtn} 
            onClick={() => navigate('/cart')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
              <path d="M9 2C7.89543 2 7 2.89543 7 4V6H5C3.89543 6 3 6.89543 3 8V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V8C21 6.89543 20.1046 6 19 6H17V4C17 2.89543 16.1046 2 15 2H9ZM9 4H15V6H9V4ZM5 8H19V19H5V8Z" fill="currentColor"/>
            </svg>
            Cart
            {cartCount > 0 && (
              <span style={styles.badge}>{cartCount}</span>
            )}
          </button>
         
          {user ? (
            <>
              {/* ✅ Admin Dashboard Button - Only visible to admins */}
              {user.isAdmin && (
                <button 
                  style={styles.adminBtn} 
                  onClick={() => navigate('/admin/dashboard')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FFD700';
                    e.currentTarget.style.color = '#1A1A1A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                    e.currentTarget.style.color = '#D4AF37';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  👨‍💼 Admin Dashboard
                </button>
              )}

              <button 
                style={styles.navBtn} 
                onClick={() => navigate('/orders')}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 7V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V7" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Orders
              </button>
              
              <button 
                style={styles.navBtn} 
                onClick={() => navigate('/wishlist')}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Wishlist
                {wishlistCount > 0 && (
                  <span style={{...styles.badge, background: '#E91E63'}}>{wishlistCount}</span>
                )}
              </button>
              
              <button 
                style={styles.navBtn} 
                onClick={() => navigate('/addresses')}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
                Addresses
              </button>

              <div style={styles.userSection}>
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name}
                    style={styles.userAvatar}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={styles.userInitial}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={styles.userName}>
                  {user.name}
                  {user.isAdmin && <span style={styles.adminBadge}>Admin</span>}
                </span>
                <button 
                  style={styles.logoutBtn} 
                  onClick={handleLogout}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E74C3C';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#E74C3C';
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <button 
              style={styles.loginBtn} 
              onClick={() => navigate('/login')}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#2C3E50'}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: '#FFFFFF',
    borderBottom: '1px solid #E8ECEF',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '1rem 0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  navContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  },
  navLogo: {
    width: '45px',
    height: 'auto',
    display: 'block'
  },
  brandName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2C3E50',
    letterSpacing: '-0.5px'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  navBtn: {
    padding: '0.6rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
    color: '#2C3E50',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    position: 'relative'
  },
  // ✅ Admin Dashboard Button Style
  adminBtn: {
    padding: '0.6rem 1rem',
    background: 'rgba(255, 215, 0, 0.1)',
    border: '2px solid #FFD700',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    color: '#D4AF37',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(255, 215, 0, 0.2)'
  },
  icon: {
    flexShrink: 0
  },
  badge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    background: '#E74C3C',
    color: 'white',
    borderRadius: '10px',
    padding: '0.15rem 0.4rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    minWidth: '18px',
    textAlign: 'center'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginLeft: '0.5rem',
    paddingLeft: '1rem',
    borderLeft: '1px solid #E8ECEF'
  },
  userName: {
    fontWeight: '600',
    color: '#2C3E50',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  // ✅ Admin Badge next to name
  adminBadge: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    color: '#1A1A1A',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid #E8ECEF',
    objectFit: 'cover'
  },
  userInitial: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#2C3E50',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.95rem'
  },
  loginBtn: {
    padding: '0.6rem 1.5rem',
    background: '#2C3E50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    color: '#E74C3C',
    border: '1px solid #E74C3C',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default Navbar;
