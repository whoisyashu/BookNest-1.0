require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for frontend (allow all origins for deployment, or use env var)
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: allowedOrigin }));

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booknest';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/barter', require('./routes/barter'));
app.use('/api/events', require('./routes/event'));
app.use('/api/promotions', require('./routes/promotion'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/payment-accounts', require('./routes/paymentAccount'));
app.use('/api/documents', require('./routes/document'));
app.use('/api/onboarding-status', require('./routes/onboardingStatus'));
app.use('/api/referrals', require('./routes/referral'));
app.use('/api/seller-tiers', require('./routes/sellerTier'));
app.use('/api/seller-rewards', require('./routes/sellerReward'));
app.use('/api/admins', require('./routes/admin'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/recommendations', require('./routes/recommendation'));
// TODO: Mount other resource routes here (books, cart, orders, etc.)

// Error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Welcome to BookNest API',
      version: '1.0.0',
      description: 'A comprehensive book marketplace API',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        books: '/api/books',
        sellers: '/api/seller',
        buyers: '/api/buyer',
        orders: '/api/orders',
        cart: '/api/cart',
        reviews: '/api/reviews',
        admin: '/api/admin'
      },
      documentation: 'See README.md for complete API documentation',
      timestamp: new Date().toISOString()
    });
  });
  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  console.log(`Server running on port ${url}`);
});
