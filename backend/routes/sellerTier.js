const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const SellerTier = require('../models/SellerTier');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Public: Get all seller tiers
router.get('/', asyncHandler(async (req, res) => {
  const tiers = await SellerTier.find();
  res.json({ success: true, data: tiers });
}));

// Public: Get seller tier by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const tier = await SellerTier.findById(req.params.id);
  if (!tier) return res.status(404).json({ success: false, message: 'Tier not found' });
  res.json({ success: true, data: tier });
}));

// Admin: Create seller tier
router.post('/', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const tier = await SellerTier.create(req.body);
  res.status(201).json({ success: true, data: tier });
}));

// Admin: Update seller tier
router.put('/:id', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const tier = await SellerTier.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!tier) return res.status(404).json({ success: false, message: 'Tier not found' });
  res.json({ success: true, data: tier });
}));

// Admin: Delete seller tier
router.delete('/:id', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const tier = await SellerTier.findByIdAndDelete(req.params.id);
  if (!tier) return res.status(404).json({ success: false, message: 'Tier not found' });
  res.json({ success: true, message: 'Tier deleted' });
}));

module.exports = router; 