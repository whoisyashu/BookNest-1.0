const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const Payment = require('../models/Payment');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Get all payments for current user (buyer or seller)
router.get('/', protect, authorizeRoles('buyer', 'seller'), asyncHandler(async (req, res) => {
  const filter = req.role === 'buyer' ? { buyerId: req.user._id } : { sellerId: req.user._id };
  const payments = await Payment.find(filter);
  res.json({ success: true, data: payments });
}));

// Get a specific payment (must be involved)
router.get('/:id', protect, authorizeRoles('buyer', 'seller'), asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  // Add logic to check if user is involved
  res.json({ success: true, data: payment });
}));

// Create a new payment (buyer only)
router.post('/', protect, authorizeRoles('buyer'), asyncHandler(async (req, res) => {
  const payment = await Payment.create(req.body);
  res.status(201).json({ success: true, data: payment });
}));

// Update payment status (seller only)
router.put('/:id/status', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json({ success: true, data: payment });
}));

module.exports = router; 