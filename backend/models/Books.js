const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author:{
        type: String,
        required: true,
        trim: true
    },
    isbn: {
        type: String,
        unique: true,
        required: true,
        maxlength: 13,
        minlength: 10
    },
    price:{
        type: Number,
        required: true,
        min: 0
    },
    paymentOptions: {
        type: [String],
        enum: ['Cash', 'Online', 'Exchange'],
        required: true,
        validate: {
            validator: function (value) {
                return value.length > 0;
            },
            message: 'At least one payment option must be selected.'
        }
    },
    Quantity: {
        type: Number,
        required: true,
        min: 1
    },
    sellerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: [true, 'Seller is required']
    },
    genre:{
        type: String,
        trim: true
    },
    description:{
        type: String,
        trim: true
    },
    condition:{
        type: String,
        enum: ['Poor', 'Fair', 'Good', 'Like-New', 'New'],
        default: 'Good'
    },
    publicationYear:{
        type: Number
    },
    publisher:{
        type: String,
        trim: true
    },
    pages:{
        type: Number,
        min:[1, 'Pages must be at least 1']
    },
    images:[{
        type: String
    }],
    format:{
        type: String,
        enum: ['hardcover', 'paperback', 'ebook', 'audiobook'],
        default: 'hardcover'
    },
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

// Indexes for faster queries
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ sellerId: 1 });
bookSchema.index({ ISBN: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ 'rating.average': -1 });

// Virtual for checking if book is in stock
bookSchema.virtual('inStock').get(function() {
  return this.quantity > 0;
});

// Ensure virtual fields are serialized
bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Books', bookSchema);