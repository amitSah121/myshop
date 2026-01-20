import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../services/firebase';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginMode, setLoginMode] = useState('email');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Handle Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    
    if (token && userStr) {
      console.log('✅ Google login successful');
      console.log('Token received:', token.substring(0, 20) + '...');
      
      // ✅ Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', userStr);
      
      // ✅ Verify it was saved
      const saved = localStorage.getItem('token');
      console.log('✅ Token saved verification:', saved?.substring(0, 20) + '...');
      
      const user = JSON.parse(decodeURIComponent(userStr));
      
      // Clean URL
      window.history.replaceState({}, '', '/login');
      
      alert(`Welcome to EverestMart, ${user.name}! 🛒✨`);
      
      // Navigate without reload
      setTimeout(() => {
        if (user.isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 500);
    }
    
    const errorParam = params.get('error');
    if (errorParam === 'auth_failed') {
      setError('Google login failed. Please try again.');
    }
  }, [location, navigate]);

  // ✅ Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('📧 Logging in with email:', formData.email);
      
      const { data } = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      console.log('✅ Login successful');
      console.log('Token received:', data.token?.substring(0, 20) + '...');
      console.log('User:', data.user);

      // ✅ Save token to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // ✅ Verify it was saved
      const savedToken = localStorage.getItem('token');
      console.log('✅ Token saved to localStorage:', savedToken?.substring(0, 20) + '...');

      alert(`Welcome back, ${data.user.name}! 🎉`);
      
      // Navigate without reload
      navigate('/');
      
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google OAuth Login
  const handleGoogleLogin = () => {
    console.log('🔐 Redirecting to Google OAuth...');
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  // ✅ Send OTP
  const sendOTP = async () => {
    if (!phoneNumber.startsWith('+')) {
      setError('Phone number must include country code (e.g., +919876543210)');
      return;
    }
  
    setError('');
    setLoading(true);
  
    try {
      // Clear existing verifier
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.log('Could not clear verifier:', e);
        }
        window.recaptchaVerifier = null;
      }
  
      console.log('📱 Sending OTP to:', phoneNumber);
      
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': (response) => {
          console.log('✅ reCAPTCHA solved');
        }
      });
      
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      window.confirmationResult = confirmationResult;
      
      setOtpSent(true);
      alert('✅ OTP sent to your phone! Check your messages.');
      setLoading(false);
    } catch (err) {
      console.error('❌ Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      setLoading(false);
      
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
    }
  };

  // ✅ Verify OTP
  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      console.log('🔐 Verifying OTP...');
      
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      const token = await user.getIdToken();
      
      console.log('✅ OTP verified successfully');
      console.log('Token received:', token.substring(0, 20) + '...');
      
      // ✅ Save token to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        name: user.displayName || 'User'
      }));
      
      // ✅ Verify it was saved
      const savedToken = localStorage.getItem('token');
      console.log('✅ Token saved to localStorage:', savedToken?.substring(0, 20) + '...');
      
      alert('✅ Login successful!');
      navigate('/');
      
    } catch (err) {
      console.error('❌ Error verifying OTP:', err);
      setError('Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  const resetPhoneLogin = () => {
    setOtpSent(false);
    setOtp('');
    setError('');
    
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.log('Error clearing verifier:', e);
      }
      window.recaptchaVerifier = null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h1 style={styles.title}>🔐 Login to EverestMart</h1>
        
        {/* ✅ Google Login Button */}
        <button 
          onClick={handleGoogleLogin}
          style={styles.googleBtn}
          disabled={loading}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine}></span>
        </div>
        
        {/* Login Mode Toggle */}
        <div style={styles.toggleContainer}>
          <button
            style={{
              ...styles.toggleBtn,
              ...(loginMode === 'email' ? styles.toggleBtnActive : {})
            }}
            onClick={() => {
              setLoginMode('email');
              setError('');
              resetPhoneLogin();
            }}
          >
            📧 Email
          </button>
          <button
            style={{
              ...styles.toggleBtn,
              ...(loginMode === 'phone' ? styles.toggleBtnActive : {})
            }}
            onClick={() => {
              setLoginMode('phone');
              setError('');
            }}
          >
            📱 Phone
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        
        {/* Email/Password Login Form */}
        {loginMode === 'email' && (
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={styles.input}
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                style={styles.input}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              style={{...styles.submitBtn, opacity: loading ? 0.6 : 1}}
              disabled={loading}
            >
              {loading ? '⏳ Logging in...' : '✓ Login'}
            </button>
          </form>
        )}

        {/* Phone OTP Login Form */}
        {loginMode === 'phone' && (
          <div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={otpSent || loading}
                style={{
                  ...styles.input,
                  backgroundColor: (otpSent || loading) ? '#f3f4f6' : 'white'
                }}
                placeholder="+919876543210"
              />
              <small style={styles.hint}>
                Include country code (e.g., +91 for India)
              </small>
            </div>

            {!otpSent && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '1.5rem',
                minHeight: '78px'
              }}>
                <div id="recaptcha-container"></div>
              </div>
            )}

            {!otpSent ? (
              <button 
                onClick={sendOTP} 
                style={{...styles.submitBtn, opacity: (loading || !phoneNumber) ? 0.6 : 1}}
                disabled={loading || !phoneNumber}
              >
                {loading ? '⏳ Sending OTP...' : '📱 Send OTP'}
              </button>
            ) : (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={styles.input}
                    placeholder="123456"
                    maxLength={6}
                    autoFocus
                    disabled={loading}
                  />
                  <small style={styles.hint}>
                    Enter the 6-digit code sent to your phone
                  </small>
                </div>

                <button 
                  onClick={verifyOTP} 
                  style={{...styles.submitBtn, opacity: (loading || otp.length !== 6) ? 0.6 : 1}}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? '⏳ Verifying...' : '✓ Verify & Login'}
                </button>

                <button 
                  onClick={resetPhoneLogin}
                  style={styles.secondaryBtn}
                  disabled={loading}
                >
                  ← Change Number
                </button>
              </>
            )}
          </div>
        )}

        <p style={styles.switchText}>
          Don't have an account? 
          <Link to="/register" style={styles.link}> Register here</Link>
        </p>
        
        <p style={styles.switchText}>
          Are you a rider? 
          <Link to="/rider/login" style={styles.link}> Rider Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  formCard: {
    background: 'white',
    padding: '3rem',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '450px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#111827',
    fontSize: '1.75rem',
    fontWeight: '600'
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
  toggleContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    background: '#f3f4f6',
    padding: '0.25rem',
    borderRadius: '10px'
  },
  toggleBtn: {
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    background: 'transparent',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  toggleBtnActive: {
    background: 'white',
    color: '#667eea',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    textAlign: 'center',
    fontSize: '0.9rem'
  },
  inputGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#374151',
    fontWeight: '600'
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s'
  },
  hint: {
    display: 'block',
    marginTop: '0.25rem',
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '0.75rem',
    transition: 'all 0.3s'
  },
  secondaryBtn: {
    width: '100%',
    padding: '0.875rem',
    background: 'transparent',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  switchText: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#6b7280',
    fontSize: '0.9375rem'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default Login;
