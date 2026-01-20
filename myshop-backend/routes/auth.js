const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Rider = require('../models/Rider');
const { auth } = require('../middleware/auth');
const passport = require('../config/passport');
const { sendWelcomeEmail, sendLoginNotification } = require('../utils/emailService');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ===================================================
// GOOGLE OAUTH ROUTES
// ===================================================

// Initiate Google OAuth
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Google OAuth Callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`,
    session: false 
  }),
  async (req, res) => {
    try {
      console.log('✅ Google OAuth successful:', req.user.email);
      
      // Check if this is a new user
      const isNewUser = req.user.isNewUser || false;
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: req.user._id, 
          email: req.user.email,
          isAdmin: req.user.isAdmin || false
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      // Prepare user data
      const userData = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        isAdmin: req.user.isAdmin || false
      };
      
      // ✅ Send appropriate email (welcome for new users, login notification for existing)
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
      
      if (isNewUser) {
        // New Google user - send welcome email
        sendWelcomeEmail(req.user.email, req.user.name)
          .then(result => {
            if (result.success) {
              console.log('📧 Welcome email sent to new Google user:', req.user.email);
            } else {
              console.error('📧 Welcome email failed:', result.error);
            }
          })
          .catch(err => console.error('📧 Email error:', err));
      } else {
        // Existing user - send login notification
        sendLoginNotification(req.user.email, req.user.name, ipAddress)
          .then(result => {
            if (result.success) {
              console.log('📧 Login notification sent to:', req.user.email);
            } else {
              console.error('📧 Login notification failed:', result.error);
            }
          })
          .catch(err => console.error('📧 Email error:', err));
      }
      
      // Redirect to frontend with token and user data
      res.redirect(
        `${FRONTEND_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`
      );
    } catch (error) {
      console.error('❌ Google callback error:', error);
      res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// ===================================================
// CUSTOMER AUTH ROUTES
// ===================================================

// Customer Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log('📝 Registration attempt:', email);
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: false
    });
    
    console.log('✅ User registered successfully:', email);
    
    // ✅ Send welcome email (async - don't block response)
    sendWelcomeEmail(email, name)
      .then(result => {
        if (result.success) {
          console.log('📧 Welcome email sent to:', email);
        } else {
          console.error('📧 Welcome email failed:', result.error);
        }
      })
      .catch(err => console.error('📧 Email error:', err));
    
    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        isAdmin: user.isAdmin
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      },
      message: 'Registration successful! Check your email for a welcome message.'
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Customer Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', email);
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log('✅ Login successful:', email, '| Admin:', user.isAdmin);
    
    // ✅ Send login notification (async - don't block response)
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
    sendLoginNotification(email, user.name, ipAddress)
      .then(result => {
        if (result.success) {
          console.log('📧 Login notification sent to:', email);
        } else {
          console.error('📧 Login notification failed:', result.error);
        }
      })
      .catch(err => console.error('📧 Email error:', err));
    
    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        isAdmin: user.isAdmin || false
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ===================================================
// ADMIN AUTH ROUTES
// ===================================================

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('👨‍💼 Admin login attempt:', email);
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is admin
    if (!user.isAdmin) {
      console.log('❌ Not an admin:', email);
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('✅ Admin login successful:', email);
    
    // ✅ Send admin login notification
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
    sendLoginNotification(email, user.name, ipAddress)
      .then(result => {
        if (result.success) {
          console.log('📧 Admin login notification sent to:', email);
        } else {
          console.error('📧 Admin notification failed:', result.error);
        }
      })
      .catch(err => console.error('📧 Email error:', err));
    
    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        isAdmin: true 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ===================================================
// RIDER AUTH ROUTES
// ===================================================

// Rider Login
router.post('/rider/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🚴 Rider login attempt:', email);
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find rider
    const rider = await Rider.findOne({ email });
    
    if (!rider) {
      console.log('❌ Rider not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check if rider is approved
    if (rider.status !== 'approved') {
      console.log('❌ Rider not approved:', email, '| Status:', rider.status);
      return res.status(403).json({ 
        error: 'Your account is pending approval. Please contact admin.',
        status: rider.status
      });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, rider.password);
    
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log('✅ Rider login successful:', email);
    
    // ✅ Send rider login notification
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
    sendLoginNotification(email, rider.name, ipAddress)
      .then(result => {
        if (result.success) {
          console.log('📧 Rider login notification sent to:', email);
        } else {
          console.error('📧 Rider notification failed:', result.error);
        }
      })
      .catch(err => console.error('📧 Email error:', err));
    
    // Generate token
    const token = jwt.sign(
      { 
        id: rider._id, 
        email: rider.email,
        role: 'rider',
        isRider: true
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      token,
      rider: {
        _id: rider._id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        role: 'rider',
        isRider: true,
        status: rider.status,
        isAvailable: rider.isAvailable,
        totalDeliveries: rider.totalDeliveries || 0,
        rating: rider.rating || 0
      }
    });
  } catch (error) {
    console.error('❌ Rider login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ===================================================
// PROFILE ROUTES
// ===================================================

// Get Profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('👤 Profile request for:', req.user.email);
    
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin || false,
        savedAddress: user.savedAddress
      }
    });
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, savedAddress } = req.body;
    
    console.log('📝 Profile update for:', req.user.email);
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (savedAddress) updateData.savedAddress = savedAddress;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ Profile updated:', user.email);
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin || false,
        savedAddress: user.savedAddress
      }
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// ===================================================
// VERIFY TOKEN
// ===================================================

router.get('/verify', auth, (req, res) => {
  res.json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin || false
    }
  });
});

module.exports = router;
