import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const statusColors = {
    'Pending': '#fef3c7',
    'Processing': '#dbeafe',
    'Shipped': '#e0e7ff',
    'Delivered': '#dcfce7',
    'Cancelled': '#fee2e2'
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 403) {
        alert('Access denied!');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Order status updated successfully!');
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      alert('Error updating status: ' + error.message);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  if (loading) return <div style={styles.loading}>Loading orders...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🛒 Order Management</h1>
        <button onClick={() => navigate('/admin')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total Orders</span>
          <span style={styles.statValue}>{orders.length}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Pending</span>
          <span style={styles.statValue}>
            {orders.filter(o => o.status === 'Pending').length}
          </span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Delivered</span>
          <span style={styles.statValue}>
            {orders.filter(o => o.status === 'Delivered').length}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} style={styles.tableRow}>
                <td style={styles.td}>{order._id.slice(-8).toUpperCase()}</td>
                <td style={styles.td}>
                  <div>
                    <div style={styles.customerName}>{order.user?.name || 'N/A'}</div>
                    <div style={styles.customerEmail}>{order.user?.email || 'N/A'}</div>
                  </div>
                </td>
                <td style={styles.td}>{order.items.length} items</td>
                <td style={styles.td}>
                  <strong>₹{order.totalAmount.toLocaleString()}</strong>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    background: statusColors[order.status]
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td style={styles.td}>
                  <button 
                    onClick={() => viewOrderDetails(order)} 
                    style={styles.viewBtn}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={styles.modal} onClick={() => setSelectedOrder(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} style={styles.closeBtn}>
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.section}>
                <h3>Order Information</h3>
                <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
              </div>

              <div style={styles.section}>
                <h3>Customer Details</h3>
                <p><strong>Name:</strong> {selectedOrder.user?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
              </div>

              <div style={styles.section}>
                <h3>Shipping Address</h3>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                <p>{selectedOrder.shippingAddress.zipCode}</p>
                <p><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</p>
              </div>

              <div style={styles.section}>
                <h3>Order Items</h3>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} style={styles.orderItem}>
                    <span>{item.product?.name || 'Product'} x {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div style={styles.orderTotal}>
                  <strong>Total: ₹{selectedOrder.totalAmount}</strong>
                </div>
              </div>

              <div style={styles.section}>
                <h3>Update Status</h3>
                <div style={styles.statusButtons}>
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                      style={{
                        ...styles.statusBtn,
                        background: statusColors[status],
                        border: selectedOrder.status === status ? '2px solid #2563eb' : 'none'
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem'
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    fontSize: '1.2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2.5rem',
    color: '#111827'
  },
  backBtn: {
    background: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '0.9rem'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827'
  },
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: '#f3f4f6'
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '1rem',
    color: '#6b7280'
  },
  customerName: {
    fontWeight: '600',
    color: '#111827'
  },
  customerEmail: {
    fontSize: '0.85rem',
    color: '#9ca3af'
  },
  statusBadge: {
    padding: '0.35rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'inline-block'
  },
  viewBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6b7280'
  },
  modalBody: {
    padding: '1.5rem'
  },
  section: {
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #e5e7eb'
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f3f4f6'
  },
  orderTotal: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '2px solid #e5e7eb',
    textAlign: 'right',
    fontSize: '1.2rem'
  },
  statusButtons: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  statusBtn: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.2s'
  }
};

export default AdminOrders;
