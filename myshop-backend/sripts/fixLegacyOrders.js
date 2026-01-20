const mongoose = require('mongoose');
const Order = require('../models/Order');
const crypto = require('crypto');
require('dotenv').config();

async function fixLegacyOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find orders without deliveryOTP
    const ordersWithoutOTP = await Order.find({ 
      $or: [
        { deliveryOTP: { $exists: false } },
        { deliveryOTP: null },
        { deliveryOTP: '' }
      ]
    });
    
    console.log(`📦 Found ${ordersWithoutOTP.length} orders without OTP`);
    
    let fixed = 0;
    let failed = 0;
    
    for (const order of ordersWithoutOTP) {
      try {
        // Generate OTP
        order.deliveryOTP = crypto.randomInt(100000, 999999).toString();
        
        // Save without validation
        await order.save({ validateBeforeSave: false });
        
        console.log(`✅ Fixed order ${order._id} - OTP: ${order.deliveryOTP}`);
        fixed++;
      } catch (error) {
        console.error(`❌ Failed to fix order ${order._id}:`, error.message);
        failed++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Fixed: ${fixed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📦 Total: ${ordersWithoutOTP.length}`);
    
    // Find orders with null shippingAddress
    const ordersWithNullAddress = await Order.find({ 
      shippingAddress: null 
    });
    
    if (ordersWithNullAddress.length > 0) {
      console.log(`\n⚠️ Found ${ordersWithNullAddress.length} orders with null shippingAddress`);
      console.log('These orders should be marked as cancelled or fixed manually:');
      ordersWithNullAddress.forEach(o => {
        console.log(`  - Order ${o._id} (Status: ${o.orderStatus})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixLegacyOrders();
