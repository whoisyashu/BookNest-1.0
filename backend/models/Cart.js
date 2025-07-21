const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: [true, 'Buyer ID is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

cartSchema.index({ buyerId: 1, isActive: 1 });

module.exports = mongoose.model('Cart', cartSchema);
