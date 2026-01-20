const mongoose = require('mongoose');
const crypto = require('crypto');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryCharges: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Online'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'paid', 'failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'preparing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider'
  },
  
  // ✅ OTP FIELDS - Changed to NOT required to support legacy orders
  deliveryOTP: {
    type: String,
    required: false, // ✅ Changed from true to false
    select: true,
    default: function() {
      // Auto-generate 6-digit OTP
      return crypto.randomInt(100000, 999999).toString();
    }
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  otpVerifiedAt: {
    type: Date,
    default: null
  },
  
  // ✅ CANCELLATION FIELDS
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'admin', 'system'],
    default: null
  },
  
  paymentDetails: {
    transactionId: String,
    method: String,
    status: String,
    paidAt: Date,
    payuResponse: Object
  },
  
  tracking: {
    acceptedAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    riderLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date
    }
  }
}, {
  timestamps: true
});

// ✅ Generate 6-digit OTP before saving (backup if default doesn't work)
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.deliveryOTP) {
    this.deliveryOTP = crypto.randomInt(100000, 999999).toString();
    console.log(`🔐 Generated OTP ${this.deliveryOTP} for order ${this._id}`);
  }
  next();
});

// ✅ Indexes for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ rider: 1, orderStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ deliveryOTP: 1 });

module.exports = mongoose.model('Order', orderSchema);
