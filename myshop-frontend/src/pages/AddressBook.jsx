// pages/AddressBook.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const { data } = await axios.get('http://localhost:5000/api/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAddresses(data.addresses);
    } catch (error) {
      console.error('Failed to load addresses:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingId) {
        // Update existing address
        await axios.put(
          `http://localhost:5000/api/addresses/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        alert('✅ Address updated successfully');
      } else {
        // Add new address
        await axios.post(
          'http://localhost:5000/api/addresses',
          formData,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        alert('✅ Address added successfully');
      }
      
      resetForm();
      loadAddresses();
    } catch (error) {
      console.error('Save address error:', error);
      alert(error.response?.data?.error || 'Failed to save address');
    }
  };

  const handleEdit = (address) => {
    setFormData({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/addresses/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      alert('✅ Address deleted');
      loadAddresses();
    } catch (error) {
      alert('Failed to delete address');
    }
  };

  const setDefault = async (addressId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/addresses/${addressId}/set-default`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      loadAddresses();
    } catch (error) {
      alert('Failed to set default address');
    }
  };

  const resetForm = () => {
    setFormData({
      label: 'Home',
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div style={styles.loading}>Loading addresses...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Addresses</h1>
        <button 
          style={styles.addBtn}
          onClick={() => setShowForm(true)}
        >
          + Add New Address
        </button>
      </div>

      {/* Address Form Modal */}
      {showForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>{editingId ? 'Edit Address' : 'Add New Address'}</h2>
              <button onClick={resetForm} style={styles.closeBtn}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <label style={styles.label}>Address Label *</label>
                <select
                  value={formData.label}
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  style={styles.input}
                  required
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.formRow}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formRow}>
                <label style={styles.label}>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={styles.input}
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div style={styles.formRow}>
                <label style={styles.label}>Address Line 1 *</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
                  style={styles.input}
                  placeholder="House No., Building Name"
                  required
                />
              </div>

              <div style={styles.formRow}>
                <label style={styles.label}>Address Line 2</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({...formData, addressLine2: e.target.value})}
                  style={styles.input}
                  placeholder="Road name, Area, Colony"
                />
              </div>

              <div style={styles.formRow}>
                <label style={styles.label}>Landmark</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                  style={styles.input}
                  placeholder="Near..."
                />
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formRow}>
                  <label style={styles.label}>City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formRow}>
                  <label style={styles.label}>State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formRow}>
                  <label style={styles.label}>Pincode *</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    style={styles.input}
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
              </div>

              <div style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                  id="isDefault"
                />
                <label htmlFor="isDefault">Set as default address</label>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn}>
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div style={styles.empty}>
          <p>No saved addresses</p>
          <button onClick={() => setShowForm(true)} style={styles.emptyBtn}>
            Add Your First Address
          </button>
        </div>
      ) : (
        <div style={styles.addressList}>
          {addresses.map(address => (
            <div key={address._id} style={styles.addressCard}>
              {address.isDefault && (
                <span style={styles.defaultBadge}>DEFAULT</span>
              )}
              
              <div style={styles.addressHeader}>
                <h3 style={styles.addressLabel}>{address.label}</h3>
                <div style={styles.addressActions}>
                  <button 
                    onClick={() => handleEdit(address)}
                    style={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(address._id)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div style={styles.addressDetails}>
                <p><strong>{address.fullName}</strong></p>
                <p>{address.phone}</p>
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                {address.landmark && <p>Landmark: {address.landmark}</p>}
                <p>{address.city}, {address.state} - {address.pincode}</p>
              </div>

              {!address.isDefault && (
                <button 
                  onClick={() => setDefault(address._id)}
                  style={styles.setDefaultBtn}
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    fontSize: '1.125rem',
    color: '#8B8B8B'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '300',
    margin: 0
  },
  addBtn: {
    padding: '0.75rem 1.5rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
    overflow: 'auto'
  },
  modalContent: {
    background: '#FFFFFF',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #E5E2DD'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#8B8B8B'
  },
  form: {
    padding: '1.5rem'
  },
  formRow: {
    marginBottom: '1.25rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #E5E2DD',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem'
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    background: '#FFFFFF',
    border: '1px solid #E5E2DD',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  saveBtn: {
    padding: '0.75rem 1.5rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    textTransform: 'uppercase'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem',
    background: '#F8F7F5'
  },
  emptyBtn: {
    marginTop: '1rem',
    padding: '1rem 2rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  addressList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  addressCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E2DD',
    padding: '1.5rem',
    position: 'relative'
  },
  defaultBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: '#22c55e',
    color: '#FFFFFF',
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  addressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem'
  },
  addressLabel: {
    fontSize: '1.125rem',
    fontWeight: '500',
    margin: 0
  },
  addressActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  editBtn: {
    padding: '0.5rem 1rem',
    background: '#F8F7F5',
    border: '1px solid #E5E2DD',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '0.5rem 1rem',
    background: '#FFFFFF',
    border: '1px solid #ef4444',
    color: '#ef4444',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  addressDetails: {
    fontSize: '0.875rem',
    lineHeight: '1.6',
    color: '#5A5A5A',
    marginBottom: '1rem'
  },
  setDefaultBtn: {
    width: '100%',
    padding: '0.75rem',
    background: '#F8F7F5',
    border: '1px solid #E5E2DD',
    cursor: 'pointer',
    fontSize: '0.875rem'
  }
};

export default AddressBook;
