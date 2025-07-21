const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const Order = require('../models/Order');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Buyer: Get their orders
router.get('/buyer', protect, authorizeRoles('buyer'), asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyerId: req.user._id });
  res.json({ success: true, data: orders });
}));

// Seller: Get their sales
router.get('/seller', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const orders = await Order.find({ sellerId: req.user._id });
  res.json({ success: true, data: orders });
}));

// Buyer: Place order
router.post('/', protect, authorizeRoles('buyer'), asyncHandler(async (req, res) => {
  // Implementation for placing order
  res.json({ success: true, message: 'Place order (not implemented)' });
}));

module.exports = router; 