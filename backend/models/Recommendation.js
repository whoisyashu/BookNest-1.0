const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },
  books: [
    {
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Books' },
      score: { type: Number }, // confidence or ranking
      basedOn: [{ type: String, enum: ['search', 'wishlist'] }], // source(s) of recommendation
      reason: { type: String } // optional explanation
    }
  ]
}, {
  timestamps: { createdAt: 'generatedAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('Recommendation', recommendationSchema); 