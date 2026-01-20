import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import io from 'socket.io-client';

let socket = null;

function RiderDashboard() {
  const [rider, setRider] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [acceptingOrderId, setAcceptingOrderId] = useState(null);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    totalDeliveries: 0
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [locationPermission, setLocationPermission] = useState('pending');
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [mapsLoaded, setMapsLoaded] = useState(false);
  
  // OTP States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  const mapContainerStyle = {
    width: '100%',
    height: '450px',
    borderRadius: '0'
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  const safeFilter = (arr, callback) => {
    return Array.isArray(arr) ? arr.filter(callback) : [];
  };

  const safeFind = (arr, callback) => {
    return Array.isArray(arr) ? arr.find(callback) : undefined;
  };

  const safeLength = (arr) => {
    return Array.isArray(arr) ? arr.length : 0;
  };

  // ============================================
  // AUTHENTICATION
  // ============================================
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const riderData = localStorage.getItem('rider');
    
    console.log('🔍 Dashboard mounted');
    console.log('Token exists:', !!token);
    console.log('Rider data exists:', !!riderData);
    
    if (!token || !riderData) {
      console.log('❌ Missing credentials, redirecting to login...');
      window.location.href = '/rider/login';
      return;
    }
    
    try {
      const rider = JSON.parse(riderData);
      console.log('✅ Rider data:', rider);
      
      if (rider.status !== 'approved') {
        alert(`Your account is ${rider.status}. Please contact admin.`);
        localStorage.clear();
        window.location.href = '/rider/login';
        return;
      }
      
      setRider(rider);
    } catch (error) {
      console.error('❌ Invalid rider data:', error);
      localStorage.clear();
      window.location.href = '/rider/login';
    }
  }, []);

  const mapCenter = currentLocation || { lat: 19.0760, lng: 72.8777 };

  useEffect(() => {
    if (rider) {
      loadRiderData();
      requestLocationPermission();
      initializeSocket();
    }
    
    return () => {
      if (socket) {
        socket.off('new-order-available');
        socket.disconnect();
      }
    };
  }, [rider]);

  // ✅ UPDATE ACTIVE ORDER WHEN ORDERS CHANGE
  useEffect(() => {
    if (orders.length > 0 && rider) {
      const active = safeFind(orders, o => {
        const isMyOrder = o.rider?._id === rider?._id || o.rider === rider?._id;
        const isActive = o.orderStatus === 'preparing' || 
                         o.orderStatus === 'shipped' || 
                         o.orderStatus === 'out_for_delivery';
        
        console.log(`🔍 Order ${o._id.slice(-8)}: isMyOrder=${isMyOrder}, isActive=${isActive}, status=${o.orderStatus}`);
        
        return isMyOrder && isActive;
      });
      
      if (active) {
        console.log('✅ Setting active order:', active._id);
        setActiveOrder(active);
        
        if (mapsLoaded && currentLocation) {
          calculateRoute(active);
        }
      } else {
        console.log('ℹ️ No active order found');
        if (activeOrder) {
          setActiveOrder(null);
          setDirections(null);
        }
      }
    }
  }, [orders, rider, mapsLoaded, currentLocation]);

  // ============================================
  // SOCKET CONNECTION
  // ============================================
  
  const initializeSocket = () => {
    if (!socket) {
      socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
      
      socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
        setConnectionStatus('connected');
        if (rider?._id) {
          socket.emit('rider-online', rider._id);
        }
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
        setConnectionStatus('disconnected');
      });

      socket.on('reconnecting', () => {
        setConnectionStatus('reconnecting');
      });
      
      socket.on('new-order-available', (orderData) => {
        console.log('🔔 NEW ORDER:', orderData);
        playNotificationSound();
        showBrowserNotification(orderData);
        setNewOrderAlert(orderData);
        loadOrders();
      });
    }
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const showBrowserNotification = (orderData) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🚀 New Delivery Order!', {
        body: `₹${orderData.totalAmount} | ${orderData.items} items | ${orderData.city || 'New order'}`,
        icon: '/logo.png',
        badge: '/logo.png',
        requireInteraction: true,
        tag: 'new-order-' + orderData.orderId
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt');
      audio.play();
    } catch (e) {
      console.log('Sound play failed:', e);
    }
    
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  // ============================================
  // DATA LOADING
  // ============================================
  
  const loadRiderData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/rider/login';
        return;
      }
      
      const { data } = await axios.get('http://localhost:5000/api/rider/earnings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats(data);
      await loadOrders();
    } catch (error) {
      console.error('Failed to load rider data:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/rider/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('📦 Loading orders...');
      
      const response = await axios.get('http://localhost:5000/api/rider/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📦 Orders API response:', response.data);
      
      let ordersData = [];
      
      if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data.orders && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else if (response.data.success && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      }
      
      console.log(`✅ Loaded ${ordersData.length} orders`);
      
      ordersData.forEach(o => {
        const riderStr = o.rider ? (o.rider._id || o.rider) : 'none';
        console.log(`  Order ${o._id.slice(-8)}: ${o.orderStatus} | Rider: ${riderStr} | My ID: ${rider?._id}`);
      });
      
      setOrders(ordersData);
      
    } catch (error) {
      console.error('❌ Failed to load orders:', error);
      setOrders([]);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/rider/login';
      }
    }
  };

  // ============================================
  // LOCATION
  // ============================================
  
  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          setLocationPermission('granted');
          updateLocationInterval();
        },
        (error) => {
          console.error('Location error:', error);
          setLocationPermission('denied');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const updateLocationInterval = () => {
    setInterval(() => {
      if (navigator.geolocation && isAvailable) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCurrentLocation(location);
            
            try {
              const token = localStorage.getItem('token');
              const response = await axios.put(
                'http://localhost:5000/api/rider/location', 
                { location },
                { headers: { Authorization: `Bearer ${token}` }}
              );
              
              console.log('✅ Location updated:', response.data);
            } catch (error) {
              console.error('Location update failed:', error.response?.data || error.message);
              
              if (error.response?.status === 401 || error.response?.status === 403) {
                alert('Session expired. Please login again.');
                localStorage.clear();
                window.location.href = '/rider/login';
              }
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
          },
          { enableHighAccuracy: true }
        );
      }
    }, 10000);
  };

  const calculateRoute = async (order) => {
    if (!mapsLoaded || !window.google || !window.google.maps) {
      console.log('⏳ Google Maps not loaded yet');
      return;
    }
    
    if (!currentLocation) {
      console.log('⏳ Current location not available');
      return;
    }
    
    const destLat = order.shippingAddress?.coordinates?.latitude || 
                    order.shippingAddress?.location?.latitude;
    const destLng = order.shippingAddress?.coordinates?.longitude || 
                    order.shippingAddress?.location?.longitude;
    
    if (!destLat || !destLng) {
      console.log('⏳ Order location not available');
      return;
    }
    
    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      const result = await directionsService.route({
        origin: currentLocation,
        destination: {
          lat: parseFloat(destLat),
          lng: parseFloat(destLng)
        },
        travelMode: window.google.maps.TravelMode.DRIVING
      });
      
      setDirections(result);
      console.log('✅ Route calculated');
    } catch (error) {
      console.error('❌ Route calculation failed:', error);
    }
  };

  // ============================================
  // ORDER ACTIONS
  // ============================================
  
  const toggleAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = !isAvailable;
      
      await axios.put(
        'http://localhost:5000/api/rider/availability',
        { isAvailable: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setIsAvailable(newStatus);
      
      const updatedRider = { ...rider, isAvailable: newStatus };
      localStorage.setItem('rider', JSON.stringify(updatedRider));
      setRider(updatedRider);
      
      if (newStatus) {
        socket?.emit('rider-online', rider._id);
        loadOrders();
      } else {
        socket?.emit('rider-offline', rider._id);
      }
    } catch (error) {
      console.error('Availability toggle failed:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      setAcceptingOrderId(orderId);
      console.log('🎯 Accepting order:', orderId);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://localhost:5000/api/rider/orders/${orderId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      console.log('✅ Accept response:', response.data);
      
      if (response.data.success) {
        alert('✅ Order accepted successfully!');
        setNewOrderAlert(null);
        await loadOrders();
        
        const earningsRes = await axios.get('http://localhost:5000/api/rider/earnings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (earningsRes.data) {
          setStats(earningsRes.data);
        }
      }
    } catch (error) {
      console.error('❌ Accept order failed:', error);
      alert(error.response?.data?.error || 'Failed to accept order');
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const markPickedUp = async () => {
    if (!activeOrder) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/rider/orders/${activeOrder._id}/pickup`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (response.data.success) {
        alert('✅ Order marked as picked up!');
        await loadOrders();
      }
    } catch (error) {
      console.error('Pickup failed:', error);
      alert(error.response?.data?.error || 'Failed to mark as picked up');
    }
  };

  const initiateDelivery = () => {
    setShowOTPModal(true);
    setOtpInput('');
    setOtpError('');
  };

  const verifyOTPAndDeliver = async () => {
    if (otpInput.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }
    
    try {
      setVerifying(true);
      setOtpError('');
      
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `http://localhost:5000/api/rider/orders/${activeOrder._id}/verify-delivery`,
        { otp: otpInput },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      alert(`✅ Delivery verified! You earned ₹${data.earnings}${data.paymentReceived ? ' | 💰 Cash received: ₹' + data.amount : ''}`);
      setShowOTPModal(false);
      setActiveOrder(null);
      setDirections(null);
      await loadRiderData();
    } catch (error) {
      console.error('OTP verification failed:', error);
      setOtpError(error.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const navigateToLocation = () => {
    if (!activeOrder?.shippingAddress) {
      alert('Delivery location not available');
      return;
    }
    
    const destLat = activeOrder.shippingAddress.coordinates?.latitude || 
                    activeOrder.shippingAddress.location?.latitude;
    const destLng = activeOrder.shippingAddress.coordinates?.longitude || 
                    activeOrder.shippingAddress.location?.longitude;
    
    if (!destLat || !destLng) {
      alert('Location coordinates not available');
      return;
    }
    
    let mapsUrl = '';
    
    if (currentLocation) {
      mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destLat},${destLng}&travelmode=driving`;
    } else {
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
    }
    
    window.open(mapsUrl, '_blank');
  };

  const callCustomer = () => {
    const phone = activeOrder?.customer?.phone || activeOrder?.shippingAddress?.phone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert('Customer phone not available');
    }
  };

  const logout = () => {
    if (socket) socket.disconnect();
    localStorage.clear();
    window.location.href = '/rider/login';
  };

  // ============================================
  // CALCULATED VALUES
  // ============================================
  
  const availableOrders = safeFilter(orders, o => {
    const hasNoRider = !o.rider;
    const isAvailableStatus = o.orderStatus === 'pending' || o.orderStatus === 'confirmed';
    
    if (hasNoRider && isAvailableStatus) {
      console.log(`✅ Available order: ${o._id.slice(-8)}`);
    }
    
    return hasNoRider && isAvailableStatus;
  });

  const availableOrdersCount = safeLength(availableOrders);

  console.log(`📊 Total orders: ${orders.length}, Available: ${availableOrdersCount}, Active: ${activeOrder ? '1' : '0'}`);

  // ============================================
  // LOADING STATE
  // ============================================
  
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  if (!rider) return null;

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div style={styles.container}>
      {/* OTP VERIFICATION MODAL */}
      {showOTPModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.otpModalBox}>
            <h2 style={styles.otpModalTitle}>🔐 Verify Delivery</h2>
            <p style={styles.otpModalDesc}>Ask the customer for their 6-digit delivery OTP</p>
            
            <input
              type="text"
              maxLength="6"
              placeholder="000000"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
              style={styles.otpInput}
              autoFocus
            />
            
            {otpError && <p style={styles.otpError}>{otpError}</p>}
            
            <div style={styles.otpModalButtons}>
              <button 
                onClick={verifyOTPAndDeliver}
                disabled={verifying || otpInput.length !== 6}
                style={{...styles.otpBtn, ...styles.otpVerifyBtn, opacity: otpInput.length !== 6 ? 0.5 : 1}}
              >
                {verifying ? 'Verifying...' : '✓ Verify & Complete'}
              </button>
              <button 
                onClick={() => setShowOTPModal(false)}
                style={{...styles.otpBtn, ...styles.otpCancelBtn}}
                disabled={verifying}
              >
                Cancel
              </button>
            </div>
            
            {activeOrder?.paymentMethod === 'COD' && (
              <div style={styles.codNotice}>
                <strong>💵 Collect Cash:</strong> ₹{activeOrder.totalAmount} from customer
              </div>
            )}
            
            {/* ✅ Add note about OTP */}
            <div style={styles.otpNote}>
              <small>
                <strong>Note:</strong> The customer can see their OTP in their order history. 
                If they cannot find it, ask them to check the order details in their account.
              </small>
            </div>
          </div>
        </div>
      )}

      {/* NEW ORDER ALERT */}
      {newOrderAlert && (
        <div style={styles.alertOverlay} onClick={() => setNewOrderAlert(null)}>
          <div style={styles.alertBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.alertHeader}>
              <div style={styles.alertIcon}>🚀</div>
              <h2 style={styles.alertTitle}>New Delivery Request</h2>
            </div>
            
            <div style={styles.alertContent}>
              <div style={styles.alertRow}>
                <span style={styles.alertLabel}>Amount</span>
                <span style={styles.alertValue}>₹{newOrderAlert.totalAmount}</span>
              </div>
              <div style={styles.alertRow}>
                <span style={styles.alertLabel}>Items</span>
                <span style={styles.alertValue}>{newOrderAlert.items} items</span>
              </div>
              <div style={styles.alertRow}>
                <span style={styles.alertLabel}>Location</span>
                <span style={styles.alertValue}>{newOrderAlert.city || newOrderAlert.location || 'N/A'}</span>
              </div>
            </div>
            
            <div style={styles.alertButtons}>
              <button 
                style={{...styles.alertBtn, ...styles.acceptBtn}}
                onClick={() => acceptOrder(newOrderAlert.orderId)}
              >
                ✓ Accept Order
              </button>
              <button 
                style={{...styles.alertBtn, ...styles.declineBtn}}
                onClick={() => setNewOrderAlert(null)}
              >
                ✕ Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Rider Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {rider.name}</p>
          <div style={styles.connectionBadge}>
            <span style={{
              ...styles.connectionDot,
              background: connectionStatus === 'connected' ? '#10b981' : '#ef4444'
            }}></span>
            {connectionStatus === 'connected' ? 'Connected' : 'Reconnecting...'}
          </div>
        </div>
        
        <div style={styles.headerRight}>
          <button 
            style={{
              ...styles.statusBtn,
              background: isAvailable ? '#10b981' : '#8B8B8B'
            }}
            onClick={toggleAvailability}
          >
            <span style={styles.statusDot}></span>
            {isAvailable ? 'Online' : 'Offline'}
          </button>
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* LOCATION PERMISSION WARNING */}
      {locationPermission === 'denied' && (
        <div style={styles.warningBanner}>
          <span>⚠️</span>
          <span>Location access denied. Please enable location to receive orders.</span>
          <button style={styles.enableBtn} onClick={requestLocationPermission}>
            Enable Location
          </button>
        </div>
      )}

      {/* STATS GRID */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>₹{stats.todayEarnings || 0}</div>
            <div style={styles.statLabel}>Today's Earnings</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>📦</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.todayDeliveries || 0}</div>
            <div style={styles.statLabel}>Today's Deliveries</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>💵</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>₹{stats.weeklyEarnings || 0}</div>
            <div style={styles.statLabel}>This Week</div>
          </div>
        </div>

        <div style={{...styles.statCard, position: 'relative'}}>
          <div style={styles.statIcon}>🚀</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{availableOrdersCount}</div>
            <div style={styles.statLabel}>Available Orders</div>
          </div>
          {availableOrdersCount > 0 && (
            <div style={styles.newBadge}>NEW</div>
          )}
        </div>
      </div>

      {/* ✅ ACTIVE ORDER SECTION - OTP REMOVED */}
      {activeOrder && (
        <div style={styles.activeOrderSection}>
          <div style={styles.activeOrderHeader}>
            <h3 style={styles.activeOrderTitle}>🚚 Active Delivery</h3>
            <span style={styles.orderStatus}>{activeOrder.orderStatus}</span>
          </div>

          <div style={styles.activeOrderContent}>
            <div style={styles.orderInfo}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Order ID</span>
                <span style={styles.infoValue}>#{activeOrder._id.slice(-8).toUpperCase()}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Amount</span>
                <span style={styles.infoValue}>₹{activeOrder.totalAmount}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Payment</span>
                <span style={styles.infoValue}>{activeOrder.paymentMethod}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Customer</span>
                <span style={styles.infoValue}>
                  {activeOrder.customer?.name || activeOrder.user?.name || activeOrder.shippingAddress?.fullName || activeOrder.shippingAddress?.name || 'N/A'}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Phone</span>
                <span style={styles.infoValue}>
                  <a href={`tel:${activeOrder.customer?.phone || activeOrder.shippingAddress?.phone}`} style={styles.phoneLink}>
                    {activeOrder.customer?.phone || activeOrder.shippingAddress?.phone || 'N/A'}
                  </a>
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Address</span>
                <span style={styles.infoValue}>
                  {activeOrder.location || `${activeOrder.shippingAddress?.addressLine1 || ''}, ${activeOrder.shippingAddress?.city || ''}`}
                </span>
              </div>
              
              {/* ❌ OTP REMOVED - DO NOT SHOW TO RIDER */}
            </div>

            {/* ACTION BUTTONS */}
            <div style={styles.orderActions}>
              <button 
                style={{...styles.actionBtn, ...styles.navigateBtn}}
                onClick={navigateToLocation}
              >
                🗺️ Navigate
              </button>
              
              <button 
                style={{...styles.actionBtn, ...styles.callBtn}}
                onClick={callCustomer}
              >
                📞 Call
              </button>
              
              {activeOrder.orderStatus === 'preparing' && (
                <button 
                  style={{...styles.actionBtn, ...styles.pickupBtn}} 
                  onClick={markPickedUp}
                >
                  📦 Pick Up
                </button>
              )}
              
              {(activeOrder.orderStatus === 'shipped' || activeOrder.orderStatus === 'out_for_delivery') && (
                <button 
                  style={{...styles.actionBtn, ...styles.deliverBtn}} 
                  onClick={initiateDelivery}
                >
                  ✓ Deliver
                </button>
              )}
            </div>
            
            {/* ✅ Add instruction for rider */}
            {(activeOrder.orderStatus === 'shipped' || activeOrder.orderStatus === 'out_for_delivery') && (
              <div style={styles.otpInstruction}>
                <span style={styles.otpInstructionIcon}>🔐</span>
                <p style={styles.otpInstructionText}>
                  <strong>To complete delivery:</strong> Ask the customer for their 6-digit OTP and enter it in the verification screen.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAP */}
      {locationPermission === 'granted' && (
        <div style={styles.mapSection}>
          <h3 style={styles.sectionTitle}>📍 Live Location</h3>
          <LoadScript 
            googleMapsApiKey="AIzaSyBxYHyG4YD4aNXR84uRcTZQdX6XvxJwxYk"
            loadingElement={<div>Loading Maps...</div>}
            preventGoogleFontsLoading={true}
            onLoad={() => {
              console.log('✅ Google Maps loaded');
              setMapsLoaded(true);
              if (activeOrder) {
                calculateRoute(activeOrder);
              }
            }}
            onError={(error) => {
              console.error('❌ Google Maps load error:', error);
            }}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={14}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false
              }}
            >
              {currentLocation && (
                <Marker 
                  position={currentLocation} 
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                  }}
                  title="Your Location"
                />
              )}
              {activeOrder?.shippingAddress?.coordinates && (
                <Marker
                  position={{
                    lat: parseFloat(activeOrder.shippingAddress.coordinates.latitude),
                    lng: parseFloat(activeOrder.shippingAddress.coordinates.longitude)
                  }}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  }}
                  title="Delivery Location"
                />
              )}
              {activeOrder?.shippingAddress?.location && (
                <Marker
                  position={{
                    lat: parseFloat(activeOrder.shippingAddress.location.latitude),
                    lng: parseFloat(activeOrder.shippingAddress.location.longitude)
                  }}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  }}
                  title="Delivery Location"
                />
              )}
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </LoadScript>
        </div>
      )}

      {/* AVAILABLE ORDERS */}
      <div style={styles.ordersSection}>
        <h3 style={styles.sectionTitle}>📦 Available Orders</h3>
        
        {!isAvailable ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔴</div>
            <p style={styles.emptyText}>You're currently offline</p>
            <p style={styles.emptySubtext}>Go online to see and accept orders</p>
            <button style={styles.goOnlineBtn} onClick={toggleAvailability}>
              Go Online
            </button>
          </div>
        ) : safeLength(availableOrders) === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>⏳</div>
            <p style={styles.emptyText}>No orders available</p>
            <p style={styles.emptySubtext}>You'll be notified when new orders arrive</p>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {availableOrders.map(order => (
              <div key={order._id} style={styles.orderCard}>
                <div style={styles.orderCardHeader}>
                  <span style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
                  <span style={styles.orderAmount}>₹{order.totalAmount}</span>
                </div>
                <div style={styles.orderCardBody}>
                  <div style={styles.orderDetail}>
                    <span style={styles.orderDetailLabel}>Items:</span>
                    <span style={styles.orderDetailValue}>{order.itemCount || safeLength(order.items)} items</span>
                  </div>
                  <div style={styles.orderDetail}>
                    <span style={styles.orderDetailLabel}>Payment:</span>
                    <span style={styles.orderDetailValue}>{order.paymentMethod}</span>
                  </div>
                  <div style={styles.orderDetail}>
                    <span style={styles.orderDetailLabel}>Location:</span>
                    <span style={styles.orderDetailValue}>
                      {order.location || order.shippingAddress?.city || 'N/A'}
                    </span>
                  </div>
                </div>
                <button 
                  style={{
                    ...styles.acceptOrderBtn,
                    opacity: acceptingOrderId === order._id ? 0.6 : 1
                  }}
                  onClick={() => acceptOrder(order._id)}
                  disabled={!isAvailable || acceptingOrderId === order._id}
                >
                  {acceptingOrderId === order._id ? 'Accepting...' : 'Accept Order'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// STYLES
// ============================================

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
    alignItems: 'center',
    background: '#FFFFFF'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid #F0EDE8',
    borderTop: '3px solid #1A1A1A',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '1rem',
    color: '#8B8B8B',
    fontSize: '0.875rem'
  },
  
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10001,
    backdropFilter: 'blur(5px)'
  },
  otpModalBox: {
    background: '#FFFFFF',
    padding: '3rem',
    borderRadius: '8px',
    maxWidth: '450px',
    width: '90%',
    textAlign: 'center'
  },
  otpModalTitle: {
    fontSize: '1.5rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: '0 0 0.5rem 0'
  },
  otpModalDesc: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    marginBottom: '2rem'
  },
  otpInput: {
    width: '100%',
    fontSize: '2.5rem',
    textAlign: 'center',
    letterSpacing: '15px',
    padding: '1rem',
    border: '2px solid #E5E2DD',
    borderRadius: '8px',
    outline: 'none',
    fontFamily: 'monospace',
    marginBottom: '1rem'
  },
  otpError: {
    color: '#EF4444',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  otpModalButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem'
  },
  otpBtn: {
    flex: 1,
    padding: '1rem',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderRadius: '4px'
  },
  otpVerifyBtn: {
    background: '#1A1A1A',
    color: '#FFFFFF'
  },
  otpCancelBtn: {
    background: '#E5E2DD',
    color: '#5A5A5A'
  },
  codNotice: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#FFF7ED',
    borderRadius: '4px',
    fontSize: '0.875rem',
    textAlign: 'left'
  },
  otpNote: {
    marginTop: '1rem',
    padding: '0.75rem',
    background: '#F0EDE8',
    borderRadius: '4px',
    fontSize: '0.8125rem',
    color: '#5A5A5A',
    textAlign: 'left',
    lineHeight: '1.5'
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2rem',
    borderBottom: '1px solid #E5E2DD',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  headerLeft: {
    flex: 1
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '300',
    color: '#1A1A1A',
    margin: 0,
    letterSpacing: '0.5px'
  },
  subtitle: {
    fontSize: '0.9375rem',
    color: '#8B8B8B',
    margin: '0.5rem 0'
  },
  connectionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: '#5A5A5A',
    marginTop: '0.5rem'
  },
  connectionDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  },
  headerRight: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  statusBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0',
    color: '#FFFFFF',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'opacity 0.2s'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#FFFFFF',
    animation: 'pulse 2s infinite'
  },
  logoutBtn: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: '1px solid #E5E2DD',
    color: '#5A5A5A',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  warningBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 2rem',
    background: '#FEF3C7',
    borderBottom: '1px solid #FCD34D',
    fontSize: '0.875rem',
    color: '#92400E'
  },
  enableBtn: {
    marginLeft: 'auto',
    padding: '0.5rem 1rem',
    background: '#92400E',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.8125rem',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    padding: '2rem',
    gap: '1.5rem'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    background: '#F8F7F5',
    border: '1px solid #E5E2DD'
  },
  statIcon: {
    fontSize: '2.5rem'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '300',
    color: '#1A1A1A'
  },
  statLabel: {
    fontSize: '0.8125rem',
    color: '#8B8B8B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '0.25rem'
  },
  newBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '0.25rem 0.75rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    fontSize: '0.625rem',
    fontWeight: '700',
    letterSpacing: '1px'
  },
  activeOrderSection: {
    margin: '0 2rem 2rem',
    background: '#F0EDE8',
    border: '2px solid #1A1A1A'
  },
  activeOrderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #E5E2DD'
  },
  activeOrderTitle: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: 0
  },
  orderStatus: {
    padding: '0.5rem 1rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  activeOrderContent: {
    padding: '1.5rem'
  },
  orderInfo: {
    marginBottom: '1.5rem'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid #E5E2DD'
  },
  infoLabel: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  infoValue: {
    fontSize: '0.9375rem',
    color: '#1A1A1A',
    fontWeight: '400'
  },
  phoneLink: {
    color: '#1A1A1A',
    textDecoration: 'underline'
  },
  orderActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.75rem'
  },
  actionBtn: {
    padding: '1rem',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'opacity 0.2s'
  },
  navigateBtn: {
    background: '#2563EB'
  },
  callBtn: {
    background: '#10B981'
  },
  pickupBtn: {
    background: '#8B7355'
  },
  deliverBtn: {
    background: '#1A1A1A'
  },
  otpInstruction: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#FFF7ED',
    border: '2px solid #FDBA74',
    borderRadius: '8px',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start'
  },
  otpInstructionIcon: {
    fontSize: '1.5rem',
    marginTop: '0.25rem'
  },
  otpInstructionText: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#92400E',
    lineHeight: '1.6'
  },
  mapSection: {
    margin: '0 2rem 2rem'
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  ordersSection: {
    padding: '0 2rem 2rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#F8F7F5'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  emptyText: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: '0.5rem 0'
  },
  emptySubtext: {
    fontSize: '0.875rem',
    color: '#8B8B8B'
  },
  goOnlineBtn: {
    marginTop: '1.5rem',
    padding: '1rem 2rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  ordersList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  orderCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E2DD',
    padding: '1.5rem'
  },
  orderCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #E5E2DD'
  },
  orderId: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    fontWeight: '500',
    letterSpacing: '0.5px'
  },
  orderAmount: {
    fontSize: '1.25rem',
    fontWeight: '400',
    color: '#1A1A1A'
  },
  orderCardBody: {
    marginBottom: '1.5rem'
  },
  orderDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    fontSize: '0.875rem'
  },
  orderDetailLabel: {
    color: '#8B8B8B'
  },
  orderDetailValue: {
    color: '#1A1A1A',
    fontWeight: '400'
  },
  acceptOrderBtn: {
    width: '100%',
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
  alertOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(4px)'
  },
  alertBox: {
    background: '#FFFFFF',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
  },
  alertHeader: {
    padding: '2rem',
    borderBottom: '1px solid #E5E2DD',
    textAlign: 'center'
  },
  alertIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  alertTitle: {
    fontSize: '1.5rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  alertContent: {
    padding: '2rem'
  },
  alertRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 0',
    borderBottom: '1px solid #F0EDE8'
  },
  alertLabel: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  alertValue: {
    fontSize: '1rem',
    fontWeight: '400',
    color: '#1A1A1A'
  },
  alertButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    borderTop: '1px solid #E5E2DD'
  },
  alertBtn: {
    padding: '1.25rem',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  acceptBtn: {
    background: '#1A1A1A',
    color: '#FFFFFF',
    borderRight: '1px solid #E5E2DD'
  },
  declineBtn: {
    background: '#FFFFFF',
    color: '#8B8B8B'
  }
};

// CSS Animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
document.head.appendChild(styleSheet);

export default RiderDashboard;
