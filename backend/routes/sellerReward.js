const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const SellerReward = require('../models/SellerReward');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Seller: Get all their rewards
router.get('/', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const rewards = await SellerReward.find({ sellerId: req.user._id });
  res.json({ success: true, data: rewards });
}));

// Admin: Add reward to seller
router.post('/', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const reward = await SellerReward.create(req.body);
  res.status(201).json({ success: true, data: reward });
}));

module.exports = router; 