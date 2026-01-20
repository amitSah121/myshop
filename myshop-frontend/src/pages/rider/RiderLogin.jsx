import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function RiderLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Check if rider is already logged in
  // useEffect(() => {
  //   const riderData = localStorage.getItem('rider');
  //   const token = localStorage.getItem('riderToken') || localStorage.getItem('token');
    
  //   if (riderData && token) {
  //     // Already logged in, redirect to dashboard
  //     navigate('/rider/dashboard');
  //   }
  // }, [navigate]);

  // ✅ Handle Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    
    if (token && userStr) {
      const user = JSON.parse(decodeURIComponent(userStr));
      
      // Check if user is a rider
      if (user.isRider || user.role === 'rider') {
        localStorage.setItem('token', token);
        localStorage.setItem('rider', JSON.stringify(user));
        
        window.history.replaceState({}, '', '/rider/login');
        
        alert(`Welcome Rider ${user.name}! 🚴`);
        
        setTimeout(() => {
          navigate('/rider/dashboard');
        }, 500);
      } else {
        setError('Access denied. Please register as a rider first.');
        window.history.replaceState({}, '', '/rider/login');
      }
    }
    
    const errorParam = params.get('error');
    if (errorParam === 'auth_failed') {
      setError('Google login failed. Please try again.');
    }
  }, [location, navigate]);

const handleEmailPasswordLogin = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    console.log('🔐 Attempting rider login...');
    
    // ✅ Use dedicated rider endpoint
    const response = await axios.post('http://localhost:5000/api/auth/rider/login', {
      email,
      password
    });
    
    console.log('✅ Login response:', response.data);
    
    const rider = response.data.rider;
    const token = response.data.token;
    
    // Store rider data
    localStorage.setItem('token', token);
    localStorage.setItem('rider', JSON.stringify(rider));
    
    alert('✅ Login successful!');
    navigate('/rider/dashboard');
    
  } catch (err) {
    console.error('❌ Login failed:', err);
    
    if (err.code === 'ERR_NETWORK') {
      setError('❌ Cannot connect to backend server.');
    } else if (err.response?.status === 401) {
      setError('❌ Invalid email or password');
    } else if (err.response?.status === 403) {
      setError('⏳ ' + err.response.data.message);
    } else if (err.response?.data?.message) {
      setError('❌ ' + err.response.data.message);
    } else {
      setError('❌ Login failed. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};


  // ✅ Google OAuth Login
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google?returnUrl=/rider/login';
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <h1 style={styles.title}>🚴 Rider Portal</h1>
          <p style={styles.subtitle}>Sign in to start delivering</p>
        </div>

        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {/* Google Login Button */}
        <button 
          onClick={handleGoogleLogin}
          style={styles.googleBtn}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine}></span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailPasswordLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rider@example.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{...styles.button, opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            {loading ? '⏳ Signing in...' : '🔓 Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/rider/register')}
              style={styles.linkButton}
            >
              Register Now
            </button>
          </p>
          <button 
            onClick={() => navigate('/')}
            style={styles.backButton}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem'
  },
  loginBox: {
    background: 'white',
    borderRadius: '16px',
    padding: '3rem',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2C3E50',
    margin: 0
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: '0.5rem 0 0 0'
  },
  error: {
    background: '#FEE2E2',
    color: '#DC2626',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    border: '1px solid #FCA5A5'
  },
  googleBtn: {
    width: '100%',
    padding: '0.95rem',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s',
    color: '#374151',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.5rem 0',
    gap: '1rem'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e5e7eb'
  },
  dividerText: {
    color: '#9ca3af',
    fontWeight: '500',
    fontSize: '0.875rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    padding: '0.875rem',
    border: '2px solid #E8ECEF',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.2s'
  },
  button: {
    padding: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginBottom: '1rem'
  },
  linkButton: {
    background: 'transparent',
    color: '#667eea',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'underline',
    fontSize: '0.9rem'
  },
  backButton: {
    background: 'transparent',
    color: '#667eea',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textDecoration: 'underline'
  }
};

export default RiderLogin;
