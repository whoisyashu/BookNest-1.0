const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required']
  },
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['credit_card', 'debit_card', 'upi', 'barter', 'mixed']
  },
  isBarterAllowed: {
    type: Boolean,
    default: false
  },
  barterItems: [
    {
      itemName: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      description: { type: String },
      image: { type: String }
    }
  ],
  barterApprovedBySeller: {
    type: Boolean,
    default: false
  },
  amount: {
    type: Number,
    required: function () {
      return this.method !== 'barter'; // amount required unless barter only
    },
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paidAt: {
    type: Date
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true, // allows null for barter-only
    required: function () {
      return this.method !== 'barter'; // required unless barter-only
    }
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  currency: {
    type: String,
    default: 'Rupee'
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
