import { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import ProductManagement from './ProductManagement';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [orders, setOrders] = useState([]);
  const [pendingRiders, setPendingRiders] = useState([]);
  const [approvedRiders, setApprovedRiders] = useState([]);
  const [stats, setStats] = useState({});
  const [liveRiders, setLiveRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRider, setSelectedRider] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
 const [mapsLoaded, setMapsLoaded] = useState(false);
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Real-time rider tracking
  useEffect(() => {
    if (activeTab === 'riders') {
      loadLiveRiders();
      const interval = setInterval(loadLiveRiders, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const loadLiveRiders = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/admin/riders/live', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiveRiders(data);
    } catch (error) {
      console.error('Failed to load live riders:', error);
    }
  };

  const loadData = async () => {
  setLoading(true);
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  try {
    if (activeTab === 'orders') {
      const { data } = await axios.get('http://localhost:5000/api/admin/orders', config);
      // ✅ Handle both formats (array or object with orders property)
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } else if (activeTab === 'riders') {
      const [pending, approved] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/riders/pending', config),
        axios.get('http://localhost:5000/api/admin/riders', config)
      ]);
      setPendingRiders(Array.isArray(pending.data) ? pending.data : []);
      setApprovedRiders(Array.isArray(approved.data) ? approved.data : []);
    } else if (activeTab === 'stats') {
      const { data } = await axios.get('http://localhost:5000/api/admin/stats', config);
      setStats(data);
    }
  } catch (error) {
    console.error('Failed to load data:', error);
    if (error.response?.status === 401) {
      alert('Session expired. Please login again.');
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  } finally {
    setLoading(false);
  }
};


  const approveRider = async (riderId) => {
    if (!window.confirm('Are you sure you want to approve this rider?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/riders/${riderId}/status`,
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Rider approved successfully!');
      loadData();
    } catch (error) {
      alert('Failed to approve rider: ' + (error.response?.data?.error || error.message));
    }
  };

  const rejectRider = async (riderId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/riders/${riderId}/status`,
        { status: 'rejected', rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('❌ Rider rejected');
      setShowRejectModal(null);
      setRejectionReason('');
      loadData();
    } catch (error) {
      alert('Failed to reject rider: ' + (error.response?.data?.error || error.message));
    }
  };

  const suspendRider = async (riderId) => {
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/riders/${riderId}/status`,
        { status: 'suspended', rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('⚠️ Rider suspended');
      loadData();
    } catch (error) {
      alert('Failed to suspend rider');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        { orderStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch (error) {
      alert('Failed to update order: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Order deleted');
      loadData();
    } catch (error) {
      alert('Failed to delete order');
    }
  };

  // Filter and search
// ✅ Add safety checks for array operations
const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
  const matchesSearch = 
    order._id?.includes(searchQuery) ||
    order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
  
  const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
  
  return matchesSearch && matchesStatus;
}) : [];

const filteredRiders = [...(Array.isArray(pendingRiders) ? pendingRiders : []), 
                        ...(Array.isArray(approvedRiders) ? approvedRiders : [])].filter(rider =>
  rider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  rider.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  rider.phone?.includes(searchQuery)
);


 

  if (loading && activeTab !== 'products') {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Manage your e-commerce platform</p>
        </div>
        <button style={styles.logoutBtn} onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/admin/login';
        }}>
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabs}>
        <button 
          onClick={() => setActiveTab('stats')}
          style={activeTab === 'stats' ? styles.activeTab : styles.tab}
        >
          📊 Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          style={activeTab === 'orders' ? styles.activeTab : styles.tab}
        >
          📦 Orders {orders.length > 0 && `(${orders.length})`}
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          style={activeTab === 'products' ? styles.activeTab : styles.tab}
        >
          🛒 Products
        </button>
        <button 
          onClick={() => setActiveTab('riders')}
          style={activeTab === 'riders' ? styles.activeTab : styles.tab}
        >
          🏍️ Riders {pendingRiders.length > 0 && (
            <span style={styles.notificationBadge}>{pendingRiders.length}</span>
          )}
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statIcon}>📦</span>
                <span style={styles.statChange}>+12%</span>
              </div>
              <div style={styles.statValue}>{stats.totalOrders || 0}</div>
              <div style={styles.statLabel}>Total Orders</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statIcon}>💰</span>
                <span style={{...styles.statChange, background: '#10b981'}}>+8%</span>
              </div>
              <div style={styles.statValue}>₹{stats.totalRevenue || 0}</div>
              <div style={styles.statLabel}>Revenue</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statIcon}>👥</span>
                <span style={styles.statChange}>+24</span>
              </div>
              <div style={styles.statValue}>{stats.totalUsers || 0}</div>
              <div style={styles.statLabel}>Customers</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statIcon}>🛒</span>
                <span style={styles.statChange}>+5</span>
              </div>
              <div style={styles.statValue}>{stats.totalProducts || 0}</div>
              <div style={styles.statLabel}>Products</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statIcon}>🏍️</span>
                <span style={{...styles.statChange, background: liveRiders.length > 0 ? '#10b981' : '#6b7280'}}>
                  {liveRiders.length} online
                </span>
              </div>
              <div style={styles.statValue}>{stats.totalRiders || 0}</div>
              <div style={styles.statLabel}>Active Riders</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statIcon}>⏳</span>
                {pendingRiders.length > 0 && (
                  <span style={{...styles.statChange, background: '#fbbf24', color: '#78350f'}}>
                    Action needed
                  </span>
                )}
              </div>
              <div style={styles.statValue}>{stats.pendingRiders || 0}</div>
              <div style={styles.statLabel}>Pending Approvals</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={styles.recentSection}>
            <h3 style={styles.sectionTitle}>Recent Orders</h3>
            {orders.slice(0, 5).map(order => (
              <div key={order._id} style={styles.recentItem}>
                <div>
                  <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                  <span style={styles.recentText}> by {order.user?.name}</span>
                </div>
                <div style={styles.recentRight}>
                  <span style={styles.recentAmount}>₹{order.totalAmount}</span>
                  <span style={{...styles.statusBadge, ...getStatusColor(order.orderStatus)}}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <div style={styles.filterSection}>
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Payment</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Rider</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyCell}>
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order._id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                      </td>
                      <td style={styles.td}>
                        {order.user?.name || 'N/A'}<br/>
                        <small style={styles.smallText}>{order.user?.email}</small>
                      </td>
                      <td style={styles.td}>
                        <strong>₹{order.totalAmount}</strong>
                      </td>
                      <td style={styles.td}>
                        {order.paymentMethod}<br/>
                        <span style={{
                          ...styles.paymentBadge,
                          background: order.paymentStatus === 'paid' ? '#10b981' : '#fbbf24'
                        }}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <select 
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          style={{...styles.statusSelect, ...getStatusColor(order.orderStatus)}}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="preparing">Preparing</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={styles.td}>
                        {order.rider?.name || (
                          <span style={styles.noRider}>Not assigned</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <button 
                          style={styles.deleteBtn}
                          onClick={() => deleteOrder(order._id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && <ProductManagement />}

      {/* Riders Tab */}
      {activeTab === 'riders' && (
        <div>
          {/* Search */}
          <div style={styles.filterSection}>
            <input
              type="text"
              placeholder="Search riders by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Pending Riders */}
          {pendingRiders.length > 0 && (
            <>
              <h2 style={styles.sectionTitle}>
                ⏳ Pending Approvals ({pendingRiders.length})
                <span style={styles.urgentBadge}>Action Required</span>
              </h2>
              
              <div style={styles.ridersList}>
                {pendingRiders.filter(rider =>
                  !searchQuery || 
                  rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  rider.email.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(rider => (
                  <div key={rider._id} style={styles.riderCard}>
                    <div style={styles.riderCardHeader}>
                      <div>
                        <h3 style={styles.riderName}>{rider.name}</h3>
                        <p style={styles.riderEmail}>{rider.email}</p>
                      </div>
                      <span style={styles.pendingBadge}>⏳ Pending</span>
                    </div>

                    <div style={styles.riderInfo}>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>📱 Phone</span>
                        <span style={styles.infoValue}>{rider.phone}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>🆔 PAN Card</span>
                        <span style={styles.infoValue}>{rider.panCard || 'Not provided'}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>🏍️ Bike Model</span>
                        <span style={styles.infoValue}>{rider.bikeDetails?.model || 'N/A'}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>🔢 Registration</span>
                        <span style={styles.infoValue}>{rider.bikeDetails?.registrationNumber || 'N/A'}</span>
                      </div>
                    </div>

                    <div style={styles.documentsSection}>
                      <h4 style={styles.documentsTitle}>📄 Documents</h4>
                      <div style={styles.documentsList}>
                        {rider.citizenshipProof && (
                          <a 
                            href={`http://localhost:5000/${rider.citizenshipProof}`}
                            target="_blank"
                            style={styles.docLink}
                          >
                            📄 Citizenship Proof
                          </a>
                        )}
                        {rider.policeRecord && (
                          <a 
                            href={`http://localhost:5000/${rider.policeRecord}`}
                            target="_blank"
                            style={styles.docLink}
                          >
                            🚔 Police Record
                          </a>
                        )}
                        {rider.bikeDetails?.rcDocument && (
                          <a 
                            href={`http://localhost:5000/${rider.bikeDetails.rcDocument}`}
                            target="_blank"
                            style={styles.docLink}
                          >
                            📋 RC Book
                          </a>
                        )}
                        {rider.bikeDetails?.insurance && (
                          <a 
                            href={`http://localhost:5000/${rider.bikeDetails.insurance}`}
                            target="_blank"
                            style={styles.docLink}
                          >
                            🛡️ Insurance
                          </a>
                        )}
                      </div>
                    </div>

                    <div style={styles.riderActions}>
                      <button 
                        onClick={() => approveRider(rider._id)}
                        style={styles.approveBtn}
                      >
                        ✓ Approve Rider
                      </button>
                      <button 
                        onClick={() => setShowRejectModal(rider._id)}
                        style={styles.rejectBtn}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Approved Riders */}
          <h2 style={styles.sectionTitle}>
            ✅ Approved Riders ({approvedRiders.length})
          </h2>
          
          <div style={styles.approvedGrid}>
            {approvedRiders.filter(rider =>
              !searchQuery || 
              rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              rider.email.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(rider => (
              <div key={rider._id} style={styles.approvedCard}>
                <div style={styles.approvedHeader}>
                  <h4 style={styles.approvedName}>{rider.name}</h4>
                  <span style={rider.isAvailable ? styles.onlineBadge : styles.offlineBadge}>
                    {rider.isAvailable ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </div>
                
                <div style={styles.approvedInfo}>
                  <div style={styles.approvedStat}>
                    <span style={styles.approvedStatLabel}>Phone</span>
                    <span style={styles.approvedStatValue}>{rider.phone}</span>
                  </div>
                  <div style={styles.approvedStat}>
                    <span style={styles.approvedStatLabel}>Rating</span>
                    <span style={styles.approvedStatValue}>⭐ {rider.rating}/5</span>
                  </div>
                  <div style={styles.approvedStat}>
                    <span style={styles.approvedStatLabel}>Deliveries</span>
                    <span style={styles.approvedStatValue}>📦 {rider.totalDeliveries || 0}</span>
                  </div>
                  <div style={styles.approvedStat}>
                    <span style={styles.approvedStatLabel}>Bike</span>
                    <span style={styles.approvedStatValue}>{rider.bikeDetails?.model || 'N/A'}</span>
                  </div>
                </div>

                <button 
                  style={styles.suspendBtn}
                  onClick={() => suspendRider(rider._id)}
                >
                  ⚠️ Suspend
                </button>
              </div>
            ))}
          </div>

          {/* Live Map */}
          {liveRiders.length > 0 && (
            <div style={styles.mapSection}>
              <h2 style={styles.sectionTitle}>
                🗺️ Live Rider Locations ({liveRiders.length} online)
              </h2>
              <LoadScript googleMapsApiKey="AIzaSyBxYHyG4YD4aNXR84uRcTZQdX6XvxJwxYk">
 {/* Live Map */}
  {activeTab === 'riders' && liveRiders.length > 0 && (
    <div style={styles.mapSection}>
      <h2 style={styles.sectionTitle}>
        🗺️ Live Rider Locations ({liveRiders.length} online)
      </h2>
      <LoadScript 
        googleMapsApiKey="AIzaSyBxYHyG4YD4aNXR84uRcTZQdX6XvxJwxYk"
        onLoad={() => {
          console.log('✅ Google Maps loaded in Admin');
          setMapsLoaded(true);
        }}
        onError={(error) => {
          console.error('❌ Google Maps load error:', error);
        }}
      >
        <GoogleMap
          mapContainerStyle={styles.mapContainer}
          center={{ lat: 19.0760, lng: 72.8777 }}
          zoom={12}
          options={{
            disableDefaultUI: false,
            zoomControl: true
          }}
        >
          {mapsLoaded && liveRiders.map(rider => (
            <Marker
              key={rider._id}
              position={{
                lat: rider.currentLocation.lat,
                lng: rider.currentLocation.lng
              }}
              onClick={() => setSelectedRider(rider)}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                // ✅ Removed scaledSize - let browser handle it
              }}
            />
          ))}
          
          {selectedRider && (
            <InfoWindow
              position={{
                lat: selectedRider.currentLocation.lat,
                lng: selectedRider.currentLocation.lng
              }}
              onCloseClick={() => setSelectedRider(null)}
            >
              <div style={styles.infoWindow}>
                <h4>{selectedRider.name}</h4>
                <p>📦 {selectedRider.totalDeliveries} deliveries</p>
                <p>⭐ {selectedRider.rating}/5</p>
                <p style={{color: '#10b981', fontWeight: '600'}}>🟢 Online</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  )}
              </LoadScript>
            </div>
          )}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRejectModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Reject Rider Application</h3>
            <p style={styles.modalText}>Please provide a reason for rejection:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="E.g., Documents not clear, incomplete information..."
              style={styles.textarea}
              rows="4"
            />
            <div style={styles.modalActions}>
              <button 
                style={styles.modalCancelBtn}
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </button>
              <button 
                style={styles.modalConfirmBtn}
                onClick={() => rejectRider(showRejectModal)}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for status colors
const getStatusColor = (status) => {
  const colors = {
    pending: { background: '#fbbf24', color: '#78350f' },
    confirmed: { background: '#3b82f6', color: '#ffffff' },
    processing: { background: '#8b5cf6', color: '#ffffff' },
    preparing: { background: '#f59e0b', color: '#ffffff' },
    shipped: { background: '#06b6d4', color: '#ffffff' },
    out_for_delivery: { background: '#10b981', color: '#ffffff' },
    delivered: { background: '#22c55e', color: '#ffffff' },
    cancelled: { background: '#ef4444', color: '#ffffff' }
  };
  return colors[status] || { background: '#6b7280', color: '#ffffff' };
};

// Map styles
const mapStyles = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#F8F7F5' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#E5E2DD' }]
  }
];

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid #F0EDE8',
    borderTop: '3px solid #1A1A1A',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2rem',
    borderBottom: '1px solid #E5E2DD'
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '300',
    color: '#1A1A1A',
    margin: 0,
    letterSpacing: '0.5px'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    margin: '0.5rem 0 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  logoutBtn: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: '1px solid #E5E2DD',
    color: '#5A5A5A',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tabs: {
    display: 'flex',
    gap: '0',
    borderBottom: '1px solid #E5E2DD',
    padding: '0 2rem'
  },
  tab: {
    padding: '1rem 1.5rem',
    background: 'none',
    border: '0',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#8B8B8B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
    position: 'relative'
  },
  activeTab: {
    padding: '1rem 1.5rem',
    background: 'none',
    border: '0',
    borderBottom: '2px solid #1A1A1A',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  notificationBadge: {
    display: 'inline-block',
    marginLeft: '0.5rem',
    padding: '0.125rem 0.5rem',
    background: '#ef4444',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '0.75rem',
    fontWeight: '700'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    padding: '2rem'
  },
  statCard: {
    padding: '1.5rem',
    background: '#F8F7F5',
    border: '1px solid #E5E2DD'
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  statIcon: {
    fontSize: '1.5rem'
  },
  statChange: {
    padding: '0.25rem 0.75rem',
    background: '#3b82f6',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '300',
    color: '#1A1A1A',
    marginBottom: '0.25rem'
  },
  statLabel: {
    fontSize: '0.8125rem',
    color: '#8B8B8B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  recentSection: {
    margin: '0 2rem 2rem',
    padding: '1.5rem',
    background: '#F8F7F5',
    border: '1px solid #E5E2DD'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: '2rem 2rem 1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  urgentBadge: {
    padding: '0.5rem 1rem',
    background: '#fbbf24',
    color: '#78350f',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  recentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
    borderBottom: '1px solid #E5E2DD'
  },
  recentText: {
    color: '#8B8B8B',
    fontSize: '0.875rem'
  },
  recentRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  recentAmount: {
    fontWeight: '500',
    color: '#1A1A1A'
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  filterSection: {
    display: 'flex',
    gap: '1rem',
    padding: '0 2rem 1rem',
    marginTop: '1rem'
  },
  searchInput: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1px solid #E5E2DD',
    fontSize: '0.875rem',
    outline: 'none'
  },
  filterSelect: {
    padding: '0.75rem 1rem',
    border: '1px solid #E5E2DD',
    fontSize: '0.875rem',
    minWidth: '200px',
    outline: 'none'
  },
  tableContainer: {
    margin: '0 2rem 2rem',
    overflowX: 'auto',
    background: '#FFFFFF',
    border: '1px solid #E5E2DD'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    background: '#F8F7F5',
    color: '#5A5A5A',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #E5E2DD'
  },
  tr: {
    borderBottom: '1px solid #F0EDE8'
  },
  td: {
    padding: '1rem',
    fontSize: '0.875rem',
    color: '#1A1A1A'
  },
  emptyCell: {
    padding: '3rem',
    textAlign: 'center',
    color: '#8B8B8B'
  },
  smallText: {
    fontSize: '0.75rem',
    color: '#8B8B8B'
  },
  paymentBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  statusSelect: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #E5E2DD',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    outline: 'none'
  },
  noRider: {
    color: '#8B8B8B',
    fontSize: '0.8125rem',
    fontStyle: 'italic'
  },
  deleteBtn: {
    padding: '0.5rem',
    background: 'transparent',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'opacity 0.2s'
  },
  ridersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    padding: '0 2rem 2rem'
  },
  riderCard: {
    background: '#FFFFFF',
    border: '2px solid #E5E2DD',
    padding: '1.5rem'
  },
  riderCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #F0EDE8'
  },
  riderName: {
    fontSize: '1.25rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: 0
  },
  riderEmail: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    margin: '0.25rem 0 0'
  },
  pendingBadge: {
    padding: '0.5rem 1rem',
    background: '#fbbf24',
    color: '#78350f',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  riderInfo: {
    marginBottom: '1.5rem'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid #F8F7F5'
  },
  infoLabel: {
    fontSize: '0.875rem',
    color: '#8B8B8B'
  },
  infoValue: {
    fontSize: '0.875rem',
    color: '#1A1A1A',
    fontWeight: '400'
  },
  documentsSection: {
    padding: '1.5rem',
    background: '#F8F7F5',
    marginBottom: '1.5rem'
  },
  documentsTitle: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '1rem'
  },
  documentsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  docLink: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '0.8125rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'opacity 0.2s'
  },
  riderActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  approveBtn: {
    padding: '1rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  rejectBtn: {
    padding: '1rem',
    background: '#FFFFFF',
    color: '#1A1A1A',
    border: '1px solid #E5E2DD',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  approvedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    padding: '0 2rem 2rem'
  },
  approvedCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E2DD',
    padding: '1.5rem'
  },
  approvedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #F0EDE8'
  },
  approvedName: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: 0
  },
  onlineBadge: {
    padding: '0.25rem 0.75rem',
    background: '#10b981',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  offlineBadge: {
    padding: '0.25rem 0.75rem',
    background: '#6b7280',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  approvedInfo: {
    marginBottom: '1rem'
  },
  approvedStat: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #F8F7F5'
  },
  approvedStatLabel: {
    fontSize: '0.8125rem',
    color: '#8B8B8B'
  },
  approvedStatValue: {
    fontSize: '0.8125rem',
    color: '#1A1A1A',
    fontWeight: '400'
  },
  suspendBtn: {
    width: '100%',
    padding: '0.75rem',
    background: 'transparent',
    border: '1px solid #E5E2DD',
    color: '#ef4444',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  mapSection: {
    margin: '2rem 2rem 0'
  },
  mapContainer: {
    width: '100%',
    height: '500px',
    border: '1px solid #E5E2DD'
  },
  infoWindow: {
    padding: '0.5rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000
  },
  modal: {
    background: '#FFFFFF',
    maxWidth: '500px',
    width: '90%'
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: 0,
    padding: '1.5rem',
    borderBottom: '1px solid #E5E2DD'
  },
  modalText: {
    fontSize: '0.875rem',
    color: '#5A5A5A',
    padding: '1.5rem 1.5rem 0.5rem'
  },
  textarea: {
    width: 'calc(100% - 3rem)',
    margin: '0 1.5rem',
    padding: '0.75rem',
    border: '1px solid #E5E2DD',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical'
  },
  modalActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    borderTop: '1px solid #E5E2DD',
    marginTop: '1.5rem'
  },
  modalCancelBtn: {
    padding: '1rem',
    background: '#FFFFFF',
    border: 'none',
    borderRight: '1px solid #E5E2DD',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#8B8B8B'
  },
  modalConfirmBtn: {
    padding: '1rem',
    background: '#FFFFFF',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#ef4444'
  }
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;
