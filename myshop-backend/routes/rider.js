const express = require('express');
const router = express.Router();
const Rider = require('../models/Rider');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const riderAuth = require('../middleware/riderAuth');
const upload = require('../config/multer');

// ============================================
// HELPER FUNCTIONS
// ============================================

// Validation helper
const validateInput = (fields) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value || value.toString().trim() === '') {
      throw new Error(`${key} is required`);
    }
  }
};

// Format address for display
const formatAddress = (address) => {
  if (!address) return 'Address not available';
  
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    address.city,
    address.state,
    address.pincode
  ].filter(Boolean);
  
  return parts.join(', ');
};

// ✅ Format order for response - WITHOUT OTP for rider
const formatOrderForRider = (order) => {
  const address = order.shippingAddress;
  
  return {
    _id: order._id,
    orderNumber: order._id.toString().slice(-8).toUpperCase(),
    totalAmount: order.totalAmount,
    deliveryCharges: order.deliveryCharges || 0,
    itemCount: order.items?.length || 0,
    items: order.items || [],
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    
    // ✅ Formatted delivery location
    location: formatAddress(address),
    
    // ✅ Complete address details
    shippingAddress: address ? {
      fullName: address.name || address.fullName || 'N/A',
      phone: address.phone || order.user?.phone || 'N/A',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      coordinates: address.coordinates || null
    } : null,
    
    // Customer details
    customer: {
      name: order.user?.name || 'Customer',
      phone: order.user?.phone || address?.phone || 'N/A',
      email: order.user?.email
    },
    
    // ❌ DO NOT INCLUDE OTP FOR RIDER
    // deliveryOTP: order.deliveryOTP,  // REMOVED
    otpVerified: order.otpVerified,
    
    // Tracking info
    tracking: order.tracking || {},
    
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// ✅ Rider Signup (Simple)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    validateInput({ name, email, password, phone });
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if rider exists
    const existingRider = await Rider.findOne({ 
      $or: [
        { email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } }, 
        { phone }
      ] 
    });
    
    if (existingRider) {
      return res.status(400).json({ 
        error: 'Rider already exists with this email or phone' 
      });
    }
    
    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ 
        error: 'Invalid phone number. Must be 10 digits' 
      });
    }
    
    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ 
        error: 'Invalid email address' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create rider
    const rider = await Rider.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      status: 'pending',
      isAvailable: false,
      totalDeliveries: 0,
      currentLocation: { lat: 19.0760, lng: 72.8777 }
    });
    
    console.log('✅ Rider registered:', rider.name, '| Email:', rider.email);
    
    // Generate token
    const token = jwt.sign(
      { id: rider._id, email: rider.email, role: 'rider', isRider: true },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({ 
      success: true, 
      token,
      rider: {
        _id: rider._id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        status: rider.status,
        isAvailable: rider.isAvailable
      },
      message: 'Registration successful! Wait for admin approval.'
    });
    
  } catch (error) {
    console.error('❌ Rider signup error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Rider Login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    
    validateInput({ email, password });
    
    // Normalize email
    email = email.toLowerCase().trim();
    
    console.log('🔐 Rider login attempt:', email);
    
    // Find rider (case-insensitive)
    const rider = await Rider.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });
    
    if (!rider) {
      console.log('❌ Rider not found:', email);
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    console.log('✅ Rider found:', rider.name, '| Status:', rider.status);
    
    // Check approval status
    if (rider.status === 'pending') {
      return res.status(403).json({ 
        error: 'Your account is pending admin approval',
        status: 'pending'
      });
    }
    
    if (rider.status === 'rejected') {
      return res.status(403).json({ 
        error: `Account rejected: ${rider.rejectionReason || 'Contact admin'}`,
        status: 'rejected'
      });
    }
    
    if (rider.status === 'suspended') {
      return res.status(403).json({ 
        error: 'Account suspended. Contact support.',
        status: 'suspended'
      });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, rider.password);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Generate token with role
    const token = jwt.sign(
      { id: rider._id, email: rider.email, role: 'rider', isRider: true },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Update last online
    rider.lastOnline = new Date();
    await rider.save();
    
    console.log('✅ Rider logged in:', rider.name);
    
    res.json({
      success: true,
      token,
      rider: {
        _id: rider._id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        isAvailable: rider.isAvailable,
        status: rider.status,
        totalDeliveries: rider.totalDeliveries || 0,
        rating: rider.rating || 0
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
});

// ✅ Rider Registration with Documents
router.post('/register-with-documents', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'citizenshipProof', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'policeRecord', maxCount: 1 },
  { name: 'rcDocument', maxCount: 1 },
  { name: 'insurance', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, password, phone, bikeModel, bikeRegistrationNumber } = req.body;
    
    console.log('📝 Rider registration with documents:', name);
    
    // Validate required fields
    validateInput({ name, email, password, phone });
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check existing rider
    const existingRider = await Rider.findOne({ 
      $or: [
        { email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } }, 
        { phone }
      ] 
    });
    
    if (existingRider) {
      return res.status(400).json({ 
        error: 'Rider already exists' 
      });
    }
    
    // Validate phone
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ 
        error: 'Invalid phone number' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Get uploaded files
    const files = req.files || {};
    
    // Create rider
    const rider = await Rider.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      status: 'pending',
      isAvailable: false,
      
      // Documents
      photo: files.photo?.[0]?.path,
      citizenshipProof: files.citizenshipProof?.[0]?.path,
      panCard: files.panCard?.[0]?.path,
      policeRecord: files.policeRecord?.[0]?.path,
      
      // Bike details
      bikeDetails: {
        model: bikeModel || '',
        registrationNumber: bikeRegistrationNumber || '',
        rcDocument: files.rcDocument?.[0]?.path,
        insurance: files.insurance?.[0]?.path
      },
      
      currentLocation: { lat: 19.0760, lng: 72.8777 }
    });
    
    console.log('✅ Rider registered with documents:', rider.name);
    
    // Generate token
    const token = jwt.sign(
      { id: rider._id, email: rider.email, role: 'rider', isRider: true },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({ 
      success: true, 
      token,
      rider: {
        _id: rider._id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        status: rider.status
      },
      message: 'Registration successful! Documents under review.'
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RIDER PROFILE & STATS
// ============================================

// ✅ Get Rider Profile
router.get('/profile', riderAuth, async (req, res) => {
  try {
    const rider = await Rider.findById(req.rider._id).select('-password');
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    res.json({ success: true, rider });
    
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ✅ Get Earnings & Stats
router.get('/earnings', riderAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Today's deliveries
    const todayOrders = await Order.find({
      rider: req.rider._id,
      orderStatus: 'delivered',
      'tracking.deliveredAt': { $gte: today }
    });
    
    // Week's deliveries
    const weekOrders = await Order.find({
      rider: req.rider._id,
      orderStatus: 'delivered',
      'tracking.deliveredAt': { $gte: startOfWeek }
    });
    
    // Month's deliveries
    const monthOrders = await Order.find({
      rider: req.rider._id,
      orderStatus: 'delivered',
      'tracking.deliveredAt': { $gte: startOfMonth }
    });
    
    // Calculate earnings (10% commission)
    const todayEarnings = todayOrders.reduce((sum, o) => sum + (o.totalAmount * 0.1), 0);
    const weeklyEarnings = weekOrders.reduce((sum, o) => sum + (o.totalAmount * 0.1), 0);
    const monthlyEarnings = monthOrders.reduce((sum, o) => sum + (o.totalAmount * 0.1), 0);
    
    // Active orders
    const activeOrders = await Order.countDocuments({ 
      rider: req.rider._id, 
      orderStatus: { $in: ['preparing', 'shipped', 'out_for_delivery'] }
    });
    
    res.json({
      todayDeliveries: todayOrders.length,
      todayEarnings: Math.round(todayEarnings),
      weeklyEarnings: Math.round(weeklyEarnings),
      monthlyEarnings: Math.round(monthlyEarnings),
      totalDeliveries: req.rider.totalDeliveries || 0,
      activeOrders
    });
    
  } catch (error) {
    console.error('❌ Earnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

// ✅ Get Delivery History
router.get('/history', riderAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const orders = await Order.find({
      rider: req.rider._id,
      orderStatus: 'delivered'
    })
    .populate('user', 'name phone')
    .populate('shippingAddress')
    .sort({ 'tracking.deliveredAt': -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const total = await Order.countDocuments({
      rider: req.rider._id,
      orderStatus: 'delivered'
    });
    
    // Format orders WITHOUT OTP
    const formattedOrders = orders.map(formatOrderForRider);
    
    res.json({
      success: true,
      orders: formattedOrders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
    
  } catch (error) {
    console.error('❌ History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ============================================
// ORDER MANAGEMENT
// ============================================

// ✅ Get Available Orders (NOT assigned to any rider)
router.get('/available-orders', riderAuth, async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: { $in: ['pending', 'confirmed', 'processing', 'preparing'] },
      rider: { $exists: false },
      paymentStatus: { $in: ['Pending', 'paid'] }
    })
    .populate('user', 'name phone email')
    .populate('items.product', 'name image price')
    .populate('shippingAddress')
    .sort({ createdAt: -1 })
    .limit(50);
    
    // Format orders WITHOUT OTP
    const formattedOrders = orders.map(formatOrderForRider);
    
    console.log(`📦 Found ${formattedOrders.length} available orders`);
    
    res.json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders
    });
    
  } catch (error) {
    console.error('❌ Available orders error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      message: error.message 
    });
  }
});

// ✅ Get My Orders (assigned to this rider)
router.get('/my-orders', riderAuth, async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { rider: req.rider._id };
    
    // Filter by status
    if (status && status !== 'all') {
      query.orderStatus = status;
    } else {
      // Default: show active orders
      query.orderStatus = { $ne: 'delivered' };
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name phone email')
      .populate('items.product', 'name image price')
      .populate('shippingAddress')
      .sort({ createdAt: -1 })
      .limit(100);
    
    // Format orders WITHOUT OTP
    const formattedOrders = orders.map(formatOrderForRider);
    
    console.log(`📦 ${req.rider.name} has ${formattedOrders.length} orders`);
    
    res.json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders
    });
    
  } catch (error) {
    console.error('❌ My orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ✅ Get Orders for Rider
router.get('/orders', riderAuth, async (req, res) => {
  try {
    console.log('📦 Fetching orders for', req.rider.name);
    
    const orders = await Order.find({
      $or: [
        { rider: null }, // Available orders
        { rider: req.rider._id } // My orders
      ]
    })
    .populate('user', 'name email phone')
    .populate('shippingAddress')
    .populate('rider', 'name phone')
    .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${orders.length} orders`);
    
    // Log each order
    orders.forEach(o => {
      console.log(`  Order ${o._id}: ${o.orderStatus} | Rider: ${o.rider?.name || 'none'}`);
    });
    
    res.json({
      success: true,
      orders: orders
    });
    
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      message: error.message 
    });
  }
});

// ✅ Accept Order - FIXED - NO OTP TO RIDER
router.post('/orders/:orderId/accept', riderAuth, async (req, res) => {
  try {
    console.log('🎯 Accept order request:', req.params.orderId);
    console.log('Rider:', req.rider.name, req.rider._id);
    
    const order = await Order.findById(req.params.orderId)
      .populate('shippingAddress')
      .populate('user', 'name phone email');
    
    if (!order) {
      console.log('❌ Order not found');
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('Order found:', order._id, '| Current status:', order.orderStatus);
    console.log('Current rider:', order.rider);
    
    // Check if already assigned to THIS rider
    if (order.rider && order.rider.toString() === req.rider._id.toString()) {
      console.log('✅ Order already assigned to you');
      return res.json({ 
        success: true,
        message: 'Order already assigned to you',
        order: {
          _id: order._id,
          orderStatus: order.orderStatus,
          rider: order.rider
        }
      });
    }
    
    // Check if assigned to ANOTHER rider
    if (order.rider) {
      console.log('❌ Order already assigned to another rider');
      return res.status(400).json({ 
        error: 'Order already assigned to another rider' 
      });
    }
    
    // Check if shippingAddress exists
    if (!order.shippingAddress) {
      console.log('❌ Order has no shipping address');
      return res.status(400).json({ 
        error: 'This order cannot be accepted',
        message: 'Order has missing shipping information.'
      });
    }
    
    if (!req.rider.isAvailable) {
      console.log('❌ Rider not available');
      return res.status(400).json({ 
        error: 'You must be online to accept orders' 
      });
    }
    
    // ✅ Generate OTP if missing (for legacy orders)
    if (!order.deliveryOTP) {
      const crypto = require('crypto');
      order.deliveryOTP = crypto.randomInt(100000, 999999).toString();
      console.log(`🔐 Generated OTP for legacy order: ${order.deliveryOTP}`);
    }
    
    // Update order
    order.rider = req.rider._id;
    order.orderStatus = 'preparing';
    
    if (!order.tracking) order.tracking = {};
    order.tracking.acceptedAt = new Date();
    
    // Save without full validation for legacy orders
    await order.save({ validateBeforeSave: false });
    
    console.log('✅ Order accepted successfully');
    
    // Socket notification to customer (with OTP)
    const io = req.app.get('io');
    if (io) {
      io.emit(`order-update-${order._id}`, {
        status: 'preparing',
        message: 'Rider accepted your order',
        rider: {
          name: req.rider.name,
          phone: req.rider.phone
        }
      });
      
      io.emit('order-taken', { orderId: order._id });
      
      // ✅ Notify customer with OTP
      if (order.user) {
        io.emit(`order-update-user-${order.user._id || order.user}`, {
          orderId: order._id,
          status: 'preparing',
          message: 'Your order has been accepted',
          deliveryOTP: order.deliveryOTP // ✅ Send OTP to customer only
        });
      }
    }
    
    // ✅ DO NOT include OTP in response to rider
    res.json({ 
      success: true,
      message: 'Order accepted successfully',
      order: {
        _id: order._id,
        orderStatus: order.orderStatus,
        rider: order.rider
        // ❌ deliveryOTP NOT included for rider
      }
    });
    
  } catch (error) {
    console.error('❌ Accept order error:', error);
    res.status(500).json({ 
      error: 'Failed to accept order',
      message: error.message 
    });
  }
});

// ✅ Mark as Picked Up
router.post('/orders/:orderId/pickup', riderAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('shippingAddress');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.rider?.toString() !== req.rider._id.toString()) {
      return res.status(403).json({ 
        error: 'Not authorized' 
      });
    }
    
    if (order.orderStatus !== 'preparing') {
      return res.status(400).json({ 
        error: 'Order not ready for pickup' 
      });
    }
    
    // Update status
    order.orderStatus = 'out_for_delivery';
    
    if (!order.tracking) order.tracking = {};
    order.tracking.pickedUpAt = new Date();
    
    await order.save();
    
    // Socket notification
    const io = req.app.get('io');
    if (io) {
      io.emit(`order-update-${order._id}`, {
        status: 'out_for_delivery',
        message: 'Your order is on the way!'
      });
    }
    
    console.log(`✅ Order ${order._id.toString().slice(-8)} picked up by ${req.rider.name}`);
    
    res.json({ 
      success: true, 
      order: formatOrderForRider(order)
    });
    
  } catch (error) {
    console.error('❌ Pickup error:', error);
    res.status(500).json({ error: 'Failed to mark as picked up' });
  }
});

// ✅ Verify OTP and Mark Delivered
router.post('/orders/:orderId/verify-delivery', riderAuth, async (req, res) => {
  try {
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ error: 'OTP is required' });
    }
    
    console.log('🔐 Verifying OTP for order:', req.params.orderId);
    console.log('Received OTP:', otp);
    
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.rider?.toString() !== req.rider._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    if (order.orderStatus === 'delivered') {
      return res.status(400).json({ error: 'Already delivered' });
    }
    
    console.log('Expected OTP:', order.deliveryOTP);
    
    // Verify OTP
    if (order.deliveryOTP.toString() !== otp.toString().trim()) {
      console.log('❌ OTP mismatch');
      return res.status(400).json({ 
        error: 'Invalid OTP. Please try again.' 
      });
    }
    
    console.log('✅ OTP verified');
    
    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        $set: {
          orderStatus: 'delivered',
          otpVerified: true,
          otpVerifiedAt: new Date(),
          paymentStatus: order.paymentMethod === 'COD' ? 'paid' : order.paymentStatus,
          'tracking.deliveredAt': new Date()
        }
      },
      { new: true, runValidators: false }
    );
    
    // Update rider stats
    await Rider.findByIdAndUpdate(req.rider._id, {
      $inc: { totalDeliveries: 1 }
    });
    
    // Socket notification
    const io = req.app.get('io');
    if (io) {
      io.emit(`order-update-${order._id}`, {
        status: 'delivered',
        message: 'Delivery completed!'
      });
    }
    
    console.log(`✅ Delivery verified: ${order._id.toString().slice(-8)}`);
    
    const earnings = Math.round(order.totalAmount * 0.1);
    
    res.json({ 
      success: true, 
      message: 'Delivery verified successfully!',
      paymentReceived: order.paymentMethod === 'COD',
      amount: order.totalAmount,
      earnings: earnings
    });
    
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// RIDER STATUS MANAGEMENT
// ============================================

// ✅ Update Availability
router.put('/availability', riderAuth, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ 
        error: 'isAvailable must be true or false' 
      });
    }
    
    req.rider.isAvailable = isAvailable;
    await req.rider.save();
    
    // Socket notification
    const io = req.app.get('io');
    if (io) {
      io.emit('rider-status-changed', {
        riderId: req.rider._id,
        isAvailable
      });
    }
    
    console.log(`✅ ${req.rider.name} is now ${isAvailable ? 'ONLINE' : 'OFFLINE'}`);
    
    res.json({ success: true, isAvailable });
    
  } catch (error) {
    console.error('❌ Availability update error:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// ✅ Update Rider Location
router.put('/location', riderAuth, async (req, res) => {
  try {
    const { location } = req.body;
    
    console.log('📍 Updating rider location:', req.rider.email);
    console.log('Location data:', location);
    
    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ 
        error: 'Invalid location data',
        message: 'Location must have lat and lng properties' 
      });
    }
    
    // Update rider location
    const rider = await Rider.findByIdAndUpdate(
      req.rider._id,
      { 
        currentLocation: {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        },
        lastLocationUpdate: new Date()
      },
      { new: true }
    );
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    console.log('✅ Location updated successfully');
    
    res.json({ 
      success: true, 
      message: 'Location updated',
      location: {
        lat: location.lat,
        lng: location.lng
      }
    });
    
  } catch (error) {
    console.error('❌ Location update error:', error);
    res.status(500).json({ 
      error: 'Failed to update location',
      message: error.message 
    });
  }
});

// ============================================
// DEBUG ROUTES
// ============================================

// Debug: Check all orders
router.get('/debug/orders', async (req, res) => {
  try {
    const allOrders = await Order.find({})
      .select('_id orderStatus paymentStatus rider createdAt totalAmount')
      .populate('shippingAddress', 'city pincode')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const stats = {
      total: await Order.countDocuments({}),
      withoutRider: await Order.countDocuments({ rider: { $exists: false } }),
      pending: await Order.countDocuments({ orderStatus: 'pending' }),
      confirmed: await Order.countDocuments({ orderStatus: 'confirmed' }),
      delivered: await Order.countDocuments({ orderStatus: 'delivered' })
    };
    
    res.json({
      stats,
      recentOrders: allOrders.map(o => ({
        id: o._id.toString().slice(-8),
        status: o.orderStatus,
        payment: o.paymentStatus,
        hasRider: !!o.rider,
        amount: o.totalAmount,
        location: o.shippingAddress ? 
          `${o.shippingAddress.city}, ${o.shippingAddress.pincode}` : 
          'No address',
        createdAt: o.createdAt
      }))
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
