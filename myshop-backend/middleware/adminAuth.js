const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log('🔍 Token received:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('🔓 Decoded:', decoded);
    
    const user = await User.findById(decoded.id || decoded._id);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (!user.isAdmin) {
      console.log('❌ Not an admin:', user.email);
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    console.log('✅ Admin authenticated:', user.email);
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = adminAuth;
