const mongoose = require('mongoose');

const barterRequestSchema = new mongoose.Schema({
  initiatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: [true, 'Buyer (initiator) is required']
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller (target) is required']
  },

  // Book requested from the Seller (must exist in database)
  requestedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Requested book is required']
  },

  // Book details offered by the buyer (manual entry)
  offeredBookDetails: {
    title: { type: String, required: [true, 'Offered book title is required'] },
    author: { type: String },
    condition: { type: String, enum: ['new', 'like_new', 'used'], default: 'used' },
    genre: { type: String },
    description: { type: String },
    image: { type: String } // optional image URL
  },

  status: {
    type: String,
    enum: ['open', 'accepted', 'rejected', 'cancelled'],
    default: 'open'
  },
  message: {
    type: String,
    trim: true
  },
  counterOffer: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['filed','open', 'accepted', 'rejected', 'cancelled', 'expired'],
    default: 'filed'
  },
  statusUpdatedAt: {
    type: Date,
    default: Date.now}
  },{
  timestamps: true
});

// Indexes
barterRequestSchema.index({ initiatorId: 1 });
barterRequestSchema.index({ targetUserId: 1 });
barterRequestSchema.index({ status: 1 });
barterRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BarterRequest', barterRequestSchema);
