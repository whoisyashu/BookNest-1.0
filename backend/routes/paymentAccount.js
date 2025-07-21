const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const PaymentAccount = require('../models/PaymentAccount');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Get all payment accounts for seller
router.get('/', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const accounts = await PaymentAccount.find({ sellerId: req.user._id });
  res.json({ success: true, data: accounts });
}));

// Get a specific payment account
router.get('/:id', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const account = await PaymentAccount.findOne({ _id: req.params.id, sellerId: req.user._id });
  if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
  res.json({ success: true, data: account });
}));

// Add a new payment account
router.post('/', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const account = await PaymentAccount.create({ ...req.body, sellerId: req.user._id });
  res.status(201).json({ success: true, data: account });
}));

// Update a payment account
router.put('/:id', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const account = await PaymentAccount.findOneAndUpdate({ _id: req.params.id, sellerId: req.user._id }, req.body, { new: true });
  if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
  res.json({ success: true, data: account });
}));

// Deactivate a payment account
router.delete('/:id', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const account = await PaymentAccount.findOneAndUpdate({ _id: req.params.id, sellerId: req.user._id }, { isActive: false }, { new: true });
  if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
  res.json({ success: true, message: 'Account deactivated' });
}));

module.exports = router; 