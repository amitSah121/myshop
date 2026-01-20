import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [deliveryOTP, setDeliveryOTP] = useState('');
  const [orderId, setOrderId] = useState('');
  
  const [newAddressForm, setNewAddressForm] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }
    setCartItems(cart);
    loadSavedAddresses();
  }, [navigate]);

  const loadSavedAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUseNewAddress(true);
        return;
      }

      const { data } = await axios.get('http://localhost:5000/api/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAddresses(data.addresses || []);
      
      // Auto-select default address
      const defaultAddr = data.addresses.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        setUseNewAddress(false);
      } else if (data.addresses.length > 0) {
        setSelectedAddressId(data.addresses[0]._id);
        setUseNewAddress(false);
      } else {
        setUseNewAddress(true);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      setUseNewAddress(true);
    }
  };

  const handleNewAddressChange = (e) => {
    setNewAddressForm({
      ...newAddressForm,
      [e.target.name]: e.target.value
    });
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to place order');
        navigate('/login');
        return;
      }

      let shippingAddress;

      // If using new address, create it first
      if (useNewAddress) {
        const { data: newAddr } = await axios.post(
          'http://localhost:5000/api/addresses',
          newAddressForm,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        shippingAddress = newAddr.address._id;
      } else {
        if (!selectedAddressId) {
          toast.error('Please select a delivery address');
          setLoading(false);
          return;
        }
        shippingAddress = selectedAddressId;
      }

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress,
        paymentMethod,
        totalAmount: getTotalPrice(),
        deliveryCharges: 0
      };

      console.log('📦 Placing order:', orderData);

      // Create order
      const { data } = await axios.post(
        'http://localhost:5000/api/orders',
        orderData,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      console.log('✅ Order created:', data);

      // Store OTP and order ID
      setDeliveryOTP(data.order.deliveryOTP);
      setOrderId(data.order._id);

      // Clear cart
      localStorage.setItem('cart', JSON.stringify([]));
      window.dispatchEvent(new Event('cartUpdated'));

      // Show OTP modal
      setShowOTPModal(true);
      
      toast.success('🎉 Order placed successfully!');
    } catch (error) {
      console.error('❌ Order placement error:', error);
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const copyOTPToClipboard = () => {
    navigator.clipboard.writeText(deliveryOTP);
    toast.success('OTP copied to clipboard!');
  };

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
    navigate('/orders');
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>Checkout</h1>

          <div style={styles.grid}>
            {/* Left Column - Address & Payment */}
            <div style={styles.formSection}>
              <form onSubmit={handlePlaceOrder}>
                
                {/* Saved Addresses Section */}
                <div style={styles.section}>
                  <h2 style={styles.sectionTitle}>Delivery Address</h2>
                  
                  {addresses.length > 0 && !useNewAddress && (
                    <div style={styles.addressList}>
                      {addresses.map(address => (
                        <div 
                          key={address._id}
                          onClick={() => setSelectedAddressId(address._id)}
                          style={{
                            ...styles.addressCard,
                            border: selectedAddressId === address._id 
                              ? '2px solid #1A1A1A' 
                              : '1px solid #E5E2DD'
                          }}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === address._id}
                            onChange={() => setSelectedAddressId(address._id)}
                            style={styles.radio}
                          />
                          <div style={styles.addressDetails}>
                            <div style={styles.addressHeader}>
                              <strong>{address.label}</strong>
                              {address.isDefault && <span style={styles.defaultBadge}>DEFAULT</span>}
                            </div>
                            <p style={styles.addressName}>{address.fullName} - {address.phone}</p>
                            <p style={styles.addressText}>
                              {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Toggle New Address Button */}
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUseNewAddress(!useNewAddress)}
                      style={styles.toggleAddressBtn}
                    >
                      {useNewAddress ? '← Use Saved Address' : '+ Add New Address'}
                    </button>
                  )}

                  {/* New Address Form */}
                  {useNewAddress && (
                    <div style={styles.newAddressForm}>
                      <h3 style={styles.formSubtitle}>Enter New Address</h3>
                      
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Address Label *</label>
                        <select
                          name="label"
                          value={newAddressForm.label}
                          onChange={handleNewAddressChange}
                          style={styles.input}
                          required
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Full Name *</label>
                          <input
                            type="text"
                            name="fullName"
                            value={newAddressForm.fullName}
                            onChange={handleNewAddressChange}
                            style={styles.input}
                            required
                          />
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={newAddressForm.phone}
                            onChange={handleNewAddressChange}
                            style={styles.input}
                            pattern="[0-9]{10}"
                            required
                          />
                        </div>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Address Line 1 *</label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={newAddressForm.addressLine1}
                          onChange={handleNewAddressChange}
                          style={styles.input}
                          placeholder="House no., Building name"
                          required
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Address Line 2</label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={newAddressForm.addressLine2}
                          onChange={handleNewAddressChange}
                          style={styles.input}
                          placeholder="Street, Area, Landmark"
                        />
                      </div>

                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>City *</label>
                          <input
                            type="text"
                            name="city"
                            value={newAddressForm.city}
                            onChange={handleNewAddressChange}
                            style={styles.input}
                            required
                          />
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>State *</label>
                          <input
                            type="text"
                            name="state"
                            value={newAddressForm.state}
                            onChange={handleNewAddressChange}
                            style={styles.input}
                            required
                          />
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Pincode *</label>
                          <input
                            type="text"
                            name="pincode"
                            value={newAddressForm.pincode}
                            onChange={handleNewAddressChange}
                            style={styles.input}
                            pattern="[0-9]{6}"
                            required
                          />
                        </div>
                      </div>

                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={newAddressForm.isDefault}
                          onChange={(e) => setNewAddressForm({
                            ...newAddressForm,
                            isDefault: e.target.checked
                          })}
                        />
                        <span>Set as default address</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div style={styles.section}>
                  <h2 style={styles.sectionTitle}>Payment Method</h2>
                  
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={styles.radio}
                      />
                      <div>
                        <span style={styles.radioText}>💵 Cash on Delivery</span>
                        <p style={styles.radioSubtext}>Pay when you receive the order</p>
                      </div>
                    </label>

                    <label style={{...styles.radioLabel, opacity: 0.5, cursor: 'not-allowed'}}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Online"
                        disabled
                        style={styles.radio}
                      />
                      <div>
                        <span style={styles.radioText}>💳 Online Payment</span>
                        <p style={styles.radioSubtext}>Coming Soon</p>
                      </div>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  style={styles.submitBtn}
                  disabled={loading || (!selectedAddressId && !useNewAddress)}
                >
                  {loading ? 'Placing Order...' : `Place Order - ₹${getTotalPrice()}`}
                </button>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div style={styles.summarySection}>
              <div style={styles.summaryCard}>
                <h2 style={styles.summaryTitle}>Order Summary</h2>

                <div style={styles.summaryItems}>
                  {cartItems.map((item) => (
                    <div key={item._id} style={styles.summaryItem}>
                      <div style={styles.itemInfo}>
                        <span style={styles.itemName}>{item.name}</span>
                        <span style={styles.itemQty}>Qty: {item.quantity}</span>
                      </div>
                      <span style={styles.itemPrice}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div style={styles.summaryDivider}></div>

                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Subtotal ({getTotalItems()} items)</span>
                  <span style={styles.summaryValue}>₹{getTotalPrice()}</span>
                </div>

                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Delivery Charges</span>
                  <span style={{...styles.summaryValue, color: '#22C55E'}}>FREE</span>
                </div>

                <div style={styles.summaryDivider}></div>

                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Total Amount</span>
                  <span style={styles.totalValue}>₹{getTotalPrice()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.otpModal}>
            <div style={styles.otpHeader}>
              <h2>🎉 Order Placed Successfully!</h2>
              <p>Order ID: #{orderId.slice(-8)}</p>
            </div>

            <div style={styles.otpDisplay}>
              <h3>🔐 Your Delivery OTP</h3>
              <div style={styles.otpCode}>{deliveryOTP}</div>
              <p style={styles.otpInstruction}>
                Share this OTP with the delivery rider to confirm delivery
              </p>
              <button onClick={copyOTPToClipboard} style={styles.copyBtn}>
                📋 Copy OTP
              </button>
            </div>

            {paymentMethod === 'COD' && (
              <div style={styles.paymentInfo}>
                <strong>💰 Payment: Cash on Delivery</strong>
                <p>Please keep ₹{getTotalPrice()} ready for payment</p>
              </div>
            )}

            <button onClick={handleCloseOTPModal} style={styles.closeModalBtn}>
              View Order Details
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFFFFF',
    padding: '2rem'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '300',
    color: '#1A1A1A',
    marginBottom: '2rem',
    letterSpacing: '0.5px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '3rem',
    '@media (max-width: 968px)': {
      gridTemplateColumns: '1fr'
    }
  },
  formSection: {},
  section: {
    marginBottom: '2.5rem'
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    marginBottom: '1.5rem',
    letterSpacing: '0.3px'
  },
  formSubtitle: {
    fontSize: '1rem',
    fontWeight: '400',
    color: '#1A1A1A',
    marginBottom: '1rem'
  },
  addressList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1rem'
  },
  addressCard: {
    display: 'flex',
    gap: '1rem',
    padding: '1.25rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: '#FAFAFA'
  },
  addressDetails: {
    flex: 1
  },
  addressHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },
  defaultBadge: {
    fontSize: '0.7rem',
    padding: '0.25rem 0.5rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    borderRadius: '2px',
    letterSpacing: '0.5px'
  },
  addressName: {
    fontSize: '0.9rem',
    color: '#5A5A5A',
    margin: '0.5rem 0'
  },
  addressText: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    lineHeight: '1.5',
    margin: 0
  },
  toggleAddressBtn: {
    padding: '0.75rem 1.5rem',
    background: '#FFFFFF',
    color: '#1A1A1A',
    border: '1px solid #1A1A1A',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '1rem'
  },
  newAddressForm: {
    marginTop: '1.5rem',
    padding: '1.5rem',
    background: '#F8F7F5',
    borderRadius: '4px'
  },
  formGroup: {
    marginBottom: '1.25rem',
    flex: 1
  },
  formRow: {
    display: 'flex',
    gap: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    color: '#5A5A5A',
    marginBottom: '0.5rem',
    letterSpacing: '0.2px'
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    fontSize: '0.9375rem',
    border: '1px solid #E5E2DD',
    borderRadius: '2px',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#1A1A1A',
    boxSizing: 'border-box'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: '#5A5A5A',
    cursor: 'pointer'
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    cursor: 'pointer',
    padding: '1rem',
    border: '1px solid #E5E2DD',
    borderRadius: '4px',
    transition: 'border-color 0.2s'
  },
  radio: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    marginTop: '0.25rem'
  },
  radioText: {
    fontSize: '0.9375rem',
    color: '#1A1A1A',
    fontWeight: '500'
  },
  radioSubtext: {
    fontSize: '0.8125rem',
    color: '#8B8B8B',
    margin: '0.25rem 0 0 0'
  },
  submitBtn: {
    width: '100%',
    padding: '1.25rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  summarySection: {
    position: 'sticky',
    top: '2rem',
    alignSelf: 'start'
  },
  summaryCard: {
    background: '#F8F7F5',
    padding: '2rem'
  },
  summaryTitle: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    marginBottom: '1.5rem',
    letterSpacing: '0.3px'
  },
  summaryItems: {
    marginBottom: '1.5rem'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  itemName: {
    fontSize: '0.9375rem',
    color: '#1A1A1A'
  },
  itemQty: {
    fontSize: '0.8125rem',
    color: '#8B8B8B'
  },
  itemPrice: {
    fontSize: '0.9375rem',
    color: '#1A1A1A',
    fontWeight: '500'
  },
  summaryDivider: {
    height: '1px',
    background: '#E5E2DD',
    margin: '1.5rem 0'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  },
  summaryLabel: {
    fontSize: '0.9375rem',
    color: '#5A5A5A'
  },
  summaryValue: {
    fontSize: '0.9375rem',
    color: '#1A1A1A'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem'
  },
  totalLabel: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A'
  },
  totalValue: {
    fontSize: '1.5rem',
    fontWeight: '500',
    color: '#1A1A1A'
  },
  
  // OTP Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  otpModal: {
    background: '#FFFFFF',
    padding: '3rem',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center'
  },
  otpHeader: {
    marginBottom: '2rem'
  },
  otpDisplay: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '2rem',
    borderRadius: '8px',
    marginBottom: '1.5rem'
  },
  otpCode: {
    fontSize: '3rem',
    fontWeight: 'bold',
    letterSpacing: '10px',
    margin: '1.5rem 0',
    fontFamily: 'monospace',
    background: 'rgba(255,255,255,0.2)',
    padding: '1rem',
    borderRadius: '8px'
  },
  otpInstruction: {
    fontSize: '0.9rem',
    marginBottom: '1rem',
    opacity: 0.9
  },
  copyBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid white',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  paymentInfo: {
    background: '#FFF7ED',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
    textAlign: 'left'
  },
  closeModalBtn: {
    width: '100%',
    padding: '1rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderRadius: '4px'
  }
};

export default Checkout;
