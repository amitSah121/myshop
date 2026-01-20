import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RiderRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bikeModel: '',
    bikeRegistrationNumber: ''
  });
  
  const [files, setFiles] = useState({
    photo: null,
    citizenshipProof: null,
    panCard: null,
    policeRecord: null,
    rcDocument: null,
    insurance: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles({ ...files, [name]: fileList[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be 10 digits');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const data = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
          data.append(key, formData[key]);
        }
      });
      
      // Append files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          data.append(key, files[key]);
        }
      });
      
      console.log('📤 Submitting registration with documents...');
      
      const response = await axios.post(
        'http://localhost:5000/api/rider/register-with-documents',
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('✅ Registration successful:', response.data);
      
      // Save token
      localStorage.setItem('riderToken', response.data.token);
      
      alert('✅ Registration successful! Your account is pending admin approval.');
      navigate('/rider/login');
      
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏍️ Rider Registration</h1>
        <p style={styles.subtitle}>Join our delivery team</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Personal Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            
            <input
              type="text"
              name="name"
              placeholder="Full Name *"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
            
            <input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
            
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (10 digits) *"
              value={formData.phone}
              onChange={handleChange}
              required
              maxLength="10"
              style={styles.input}
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 characters) *"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
            
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password *"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          
          {/* Documents Upload */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Documents Upload</h3>
            
            <div style={styles.fileInput}>
              <label style={styles.fileLabel}>
                📷 Passport Size Photo
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={styles.hiddenInput}
                />
              </label>
              {files.photo && <span style={styles.fileName}>✓ {files.photo.name}</span>}
            </div>
            
            <div style={styles.fileInput}>
              <label style={styles.fileLabel}>
                🆔 Citizenship Proof
                <input
                  type="file"
                  name="citizenshipProof"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  style={styles.hiddenInput}
                />
              </label>
              {files.citizenshipProof && <span style={styles.fileName}>✓ {files.citizenshipProof.name}</span>}
            </div>
            
            <div style={styles.fileInput}>
              <label style={styles.fileLabel}>
                💳 PAN Card
                <input
                  type="file"
                  name="panCard"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  style={styles.hiddenInput}
                />
              </label>
              {files.panCard && <span style={styles.fileName}>✓ {files.panCard.name}</span>}
            </div>
            
            <div style={styles.fileInput}>
              <label style={styles.fileLabel}>
                👮 Police Record
                <input
                  type="file"
                  name="policeRecord"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  style={styles.hiddenInput}
                />
              </label>
              {files.policeRecord && <span style={styles.fileName}>✓ {files.policeRecord.name}</span>}
            </div>
          </div>
          
          {/* Bike Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Bike Details</h3>
            
            <input
              type="text"
              name="bikeModel"
              placeholder="Bike Model (e.g., Honda Activa)"
              value={formData.bikeModel}
              onChange={handleChange}
              style={styles.input}
            />
            
            <input
              type="text"
              name="bikeRegistrationNumber"
              placeholder="Registration Number (e.g., MH12AB1234)"
              value={formData.bikeRegistrationNumber}
              onChange={handleChange}
              style={styles.input}
            />
            
            <div style={styles.fileInput}>
              <label style={styles.fileLabel}>
                📄 RC Book
                <input
                  type="file"
                  name="rcDocument"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  style={styles.hiddenInput}
                />
              </label>
              {files.rcDocument && <span style={styles.fileName}>✓ {files.rcDocument.name}</span>}
            </div>
            
            <div style={styles.fileInput}>
              <label style={styles.fileLabel}>
                🛡️ Insurance Document
                <input
                  type="file"
                  name="insurance"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  style={styles.hiddenInput}
                />
              </label>
              {files.insurance && <span style={styles.fileName}>✓ {files.insurance.name}</span>}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{...styles.submitBtn, opacity: loading ? 0.6 : 1}}
          >
            {loading ? '⏳ Registering...' : '✓ Register as Rider'}
          </button>
          
          <p style={styles.loginLink}>
            Already have an account?{' '}
            <span onClick={() => navigate('/rider/login')} style={styles.link}>
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '2.5rem',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '600',
    color: '#1A1A1A',
    margin: '0 0 0.5rem 0',
    textAlign: 'center'
  },
  subtitle: {
    color: '#8B8B8B',
    textAlign: 'center',
    marginBottom: '2rem'
  },
  error: {
    background: '#FEE2E2',
    border: '1px solid #EF4444',
    color: '#991B1B',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #E5E2DD'
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '500',
    color: '#1A1A1A',
    margin: 0
  },
  input: {
    padding: '0.875rem',
    border: '1px solid #E5E2DD',
    borderRadius: '6px',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  fileInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  fileLabel: {
    display: 'inline-block',
    padding: '0.875rem',
    background: '#F8F7F5',
    border: '1px dashed #8B8B8B',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: '0.9375rem',
    color: '#5A5A5A',
    transition: 'all 0.3s'
  },
  hiddenInput: {
    display: 'none'
  },
  fileName: {
    fontSize: '0.8125rem',
    color: '#22C55E',
    fontWeight: '500'
  },
  submitBtn: {
    padding: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  loginLink: {
    textAlign: 'center',
    color: '#5A5A5A',
    fontSize: '0.9375rem'
  },
  link: {
    color: '#667eea',
    cursor: 'pointer',
    fontWeight: '500',
    textDecoration: 'underline'
  }
};

export default RiderRegister;
