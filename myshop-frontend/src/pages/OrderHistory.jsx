import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('📦 Loading orders...');
      
      const { data } = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Orders loaded:', data);
      
      // Handle different response formats
      const ordersList = data.orders || data || [];
      console.log('Orders count:', ordersList.length);
      
      // Log first order to check structure
      if (ordersList.length > 0) {
        console.log('Sample order:', ordersList[0]);
        console.log('Has deliveryOTP:', !!ordersList[0].deliveryOTP);
      }
      
      setOrders(ordersList);
    } catch (error) {
      console.error('❌ Failed to load orders:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.clear();
        navigate('/login');
      } else {
        alert('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const showOTP = (order) => {
    console.log('🔐 Showing OTP for order:', order._id);
    console.log('OTP value:', order.deliveryOTP);
    
    if (!order.deliveryOTP) {
      alert('⚠️ Delivery OTP not available for this order');
      return;
    }
    
    setSelectedOrder(order);
    setShowOTPModal(true);
  };

  const copyOTP = () => {
    if (!selectedOrder?.deliveryOTP) {
      alert('❌ No OTP to copy');
      return;
    }
    
    navigator.clipboard.writeText(selectedOrder.deliveryOTP)
      .then(() => {
        alert('✅ OTP copied to clipboard!');
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = selectedOrder.deliveryOTP;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('✅ OTP copied to clipboard!');
      });
  };

  const cancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to cancel this order?\n\nThis action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    try {
      setCancellingOrderId(orderId);
      const token = localStorage.getItem('token');
      
      const { data } = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        { reason: 'Customer requested cancellation' },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (data.success) {
        alert('✅ Order cancelled successfully');
        await loadOrders(); // Reload orders
      }
    } catch (error) {
      console.error('❌ Cancel failed:', error);
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.error || 
                       'Failed to cancel order';
      alert(`❌ ${errorMsg}`);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const canCancelOrder = (order) => {
    const cancellableStatuses = ['pending', 'confirmed', 'preparing'];
    return cancellableStatuses.includes(order.orderStatus);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      preparing: '#8B5CF6',
      shipped: '#06B6D4',
      out_for_delivery: '#10B981',
      delivered: '#22C55E',
      cancelled: '#EF4444',
      returned: '#F97316'
    };
    return colors[status] || '#8B8B8B';
  };

  const getStatusText = (status) => {
    const text = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned'
    };
    return text[status] || status;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ✅ OTP Modal - Shows OTP to CUSTOMER ONLY */}
      {showOTPModal && selectedOrder && (
        <div style={styles.modalOverlay} onClick={() => setShowOTPModal(false)}>
          <div style={styles.otpModal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.otpModalTitle}>🔐 Delivery OTP</h2>
            <p style={styles.otpModalDesc}>
              Share this OTP with the delivery rider to confirm delivery
            </p>
            
            <div style={styles.otpDisplay}>
              <div style={styles.otpCode}>
                {selectedOrder.deliveryOTP || '------'}
              </div>
            </div>
            
            <div style={styles.otpInfo}>
              <div style={styles.otpInfoRow}>
                <span>Order ID:</span>
                <strong>#{selectedOrder._id.slice(-8).toUpperCase()}</strong>
              </div>
              <div style={styles.otpInfoRow}>
                <span>Status:</span>
                <strong style={{ color: getStatusColor(selectedOrder.orderStatus) }}>
                  {getStatusText(selectedOrder.orderStatus)}
                </strong>
              </div>
              <div style={styles.otpInfoRow}>
                <span>Total Amount:</span>
                <strong>₹{selectedOrder.totalAmount}</strong>
              </div>
              <div style={styles.otpInfoRow}>
                <span>Payment Method:</span>
                <strong>{selectedOrder.paymentMethod}</strong>
              </div>
              {selectedOrder.paymentMethod === 'COD' && (
                <div style={styles.codWarning}>
                  💵 <strong>Cash on Delivery:</strong> Pay ₹{selectedOrder.totalAmount} to the rider
                </div>
              )}
            </div>
            
            <div style={styles.modalButtons}>
              <button onClick={copyOTP} style={styles.copyBtn}>
                📋 Copy OTP
              </button>
              <button onClick={() => setShowOTPModal(false)} style={styles.closeBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>My Orders</h1>
        <p style={styles.subtitle}>Track your order history and deliveries</p>
      </div>

      {orders.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📦</div>
          <h2 style={styles.emptyTitle}>No Orders Yet</h2>
          <p style={styles.emptyText}>Start shopping to see your orders here</p>
          <button style={styles.shopBtn} onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      ) : (
        <div style={styles.ordersList}>
          {orders.map((order) => (
            <div key={order._id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div style={styles.orderHeaderLeft}>
                  <span style={styles.orderId}>
                    Order #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <span style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <span 
                  style={{
                    ...styles.statusBadge,
                    background: getStatusColor(order.orderStatus)
                  }}
                >
                  {getStatusText(order.orderStatus)}
                </span>
              </div>

              <div style={styles.orderBody}>
                <div style={styles.orderItems}>
                  <strong style={styles.itemsCount}>
                    {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                  </strong>
                  <div style={styles.itemsList}>
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <span key={idx} style={styles.itemName}>
                        • {item.product?.name || 'Product'} × {item.quantity}
                      </span>
                    ))}
                    {order.items?.length > 3 && (
                      <span style={styles.moreItems}>
                        +{order.items.length - 3} more items
                      </span>
                    )}
                  </div>
                </div>

                <div style={styles.orderDetails}>
                  <div style={styles.detailRow}>
                    <span>Subtotal:</span>
                    <span>₹{(order.totalAmount - (order.deliveryCharges || 0)).toFixed(2)}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Delivery:</span>
                    <span>₹{order.deliveryCharges || 0}</span>
                  </div>
                  <div style={{...styles.detailRow, ...styles.totalRow}}>
                    <span>Total Amount:</span>
                    <strong style={styles.amount}>₹{order.totalAmount}</strong>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Payment:</span>
                    <strong>{order.paymentMethod}</strong>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Payment Status:</span>
                    <strong style={{ 
                      color: order.paymentStatus === 'paid' ? '#22C55E' : '#F59E0B' 
                    }}>
                      {order.paymentStatus}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Rider Info */}
              {order.rider && (
                <div style={styles.riderSection}>
                  <div style={styles.riderIcon}>🏍️</div>
                  <div style={styles.riderDetails}>
                    <strong>{order.rider.name}</strong>
                    <span style={styles.riderPhone}>{order.rider.phone}</span>
                  </div>
                  {order.orderStatus === 'out_for_delivery' && (
                    <a 
                      href={`tel:${order.rider.phone}`}
                      style={styles.callBtn}
                    >
                      📞 Call Rider
                    </a>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={styles.orderFooter}>
                {/* ✅ Show OTP for active orders */}
                {order.orderStatus !== 'delivered' && 
                 order.orderStatus !== 'cancelled' && 
                 order.deliveryOTP && (
                  <button 
                    style={styles.otpBtn}
                    onClick={() => showOTP(order)}
                  >
                    🔐 View Delivery OTP
                  </button>
                )}
                
                {/* Cancel button */}
                {canCancelOrder(order) && (
                  <button 
                    style={{
                      ...styles.cancelBtn,
                      opacity: cancellingOrderId === order._id ? 0.6 : 1
                    }}
                    onClick={() => cancelOrder(order._id)}
                    disabled={cancellingOrderId === order._id}
                  >
                    {cancellingOrderId === order._id ? 'Cancelling...' : '✕ Cancel Order'}
                  </button>
                )}
                
                {/* Delivered badge */}
                {order.orderStatus === 'delivered' && order.otpVerified && (
                  <div style={styles.deliveredBadge}>
                    ✅ Delivered 
                    {order.otpVerifiedAt && ` on ${new Date(order.otpVerifiedAt).toLocaleDateString('en-IN')}`}
                  </div>
                )}
                
                {/* Cancelled badge */}
                {order.orderStatus === 'cancelled' && (
                  <div style={styles.cancelledBadge}>
                    ✕ Cancelled
                    {order.cancelledAt && ` on ${new Date(order.cancelledAt).toLocaleDateString('en-IN')}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#F8F7F5',
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  loadingContainer: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E5E2DD',
    borderTop: '3px solid #1A1A1A',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(5px)',
    padding: '1rem'
  },
  otpModal: {
    background: '#FFFFFF',
    padding: '2.5rem',
    borderRadius: '16px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
    animation: 'slideUp 0.3s ease-out'
  },
  otpModalTitle: {
    fontSize: '1.75rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: '0 0 0.5rem 0',
    textAlign: 'center'
  },
  otpModalDesc: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    textAlign: 'center',
    marginBottom: '2rem',
    lineHeight: '1.5'
  },
  otpDisplay: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
  },
  otpCode: {
    fontSize: '3rem',
    fontWeight: 'bold',
    letterSpacing: '12px',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'monospace',
    background: 'rgba(255,255,255,0.2)',
    padding: '1rem',
    borderRadius: '8px'
  },
  otpInfo: {
    background: '#F8F7F5',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem'
  },
  otpInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid #E5E2DD',
    fontSize: '0.9375rem'
  },
  codWarning: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#FFF7ED',
    border: '2px solid #FDBA74',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#92400E',
    lineHeight: '1.5'
  },
  modalButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  copyBtn: {
    padding: '1rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s'
  },
  closeBtn: {
    padding: '1rem',
    background: '#E5E2DD',
    color: '#5A5A5A',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s'
  },
  
  header: {
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '2px solid #E5E2DD'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '300',
    color: '#1A1A1A',
    margin: 0,
    letterSpacing: '0.5px'
  },
  subtitle: {
    color: '#8B8B8B',
    fontSize: '1rem',
    margin: '0.5rem 0 0 0'
  },
  emptyState: {
    textAlign: 'center',
    padding: '5rem 2rem',
    background: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E5E2DD'
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '1.5rem'
  },
  emptyTitle: {
    fontSize: '1.75rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: '0 0 0.75rem 0'
  },
  emptyText: {
    color: '#8B8B8B',
    fontSize: '1rem',
    marginBottom: '2rem'
  },
  shopBtn: {
    padding: '1rem 2.5rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.9375rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderRadius: '6px',
    transition: 'all 0.2s'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  orderCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E2DD',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    background: '#F8F7F5',
    borderBottom: '1px solid #E5E2DD'
  },
  orderHeaderLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  orderId: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: '0.5px'
  },
  orderDate: {
    fontSize: '0.8125rem',
    color: '#8B8B8B'
  },
  statusBadge: {
    padding: '0.5rem 1.25rem',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderRadius: '20px',
    whiteSpace: 'nowrap'
  },
  orderBody: {
    padding: '1.5rem',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '2rem',
    borderBottom: '1px solid #E5E2DD'
  },
  orderItems: {
    borderRight: '1px solid #E5E2DD',
    paddingRight: '2rem'
  },
  itemsCount: {
    fontSize: '1rem',
    color: '#1A1A1A',
    display: 'block',
    marginBottom: '0.75rem'
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  itemName: {
    fontSize: '0.875rem',
    color: '#5A5A5A',
    lineHeight: '1.5'
  },
  moreItems: {
    fontSize: '0.8125rem',
    color: '#8B8B8B',
    fontStyle: 'italic',
    marginTop: '0.25rem'
  },
  orderDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    color: '#5A5A5A'
  },
  totalRow: {
    paddingTop: '0.75rem',
    borderTop: '1px solid #E5E2DD',
    marginTop: '0.25rem'
  },
  amount: {
    fontSize: '1.25rem',
    color: '#1A1A1A'
  },
  riderSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    background: '#F0EDE8',
    borderBottom: '1px solid #E5E2DD'
  },
  riderIcon: {
    fontSize: '2rem'
  },
  riderDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  riderPhone: {
    fontSize: '0.875rem',
    color: '#8B8B8B'
  },
  callBtn: {
    padding: '0.75rem 1.5rem',
    background: '#10B981',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap'
  },
  orderFooter: {
    padding: '1.25rem 1.5rem',
    background: '#F8F7F5',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  otpBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    background: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s'
  },
  deliveredBadge: {
    padding: '0.75rem 1.25rem',
    background: '#D1FAE5',
    color: '#065F46',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  cancelledBadge: {
    padding: '0.75rem 1.25rem',
    background: '#FEE2E2',
    color: '#991B1B',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  button:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    .orderBody {
      grid-template-columns: 1fr !important;
    }
    
    .orderItems {
      border-right: none !important;
      border-bottom: 1px solid #E5E2DD;
      padding-right: 0 !important;
      padding-bottom: 1.5rem;
    }
  }
`;
if (!document.head.querySelector('style[data-order-history]')) {
  styleSheet.setAttribute('data-order-history', 'true');
  document.head.appendChild(styleSheet);
}

export default OrderHistory;
