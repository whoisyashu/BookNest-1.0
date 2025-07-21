const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const Referral = require('../models/Referral');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Get all referrals for seller
router.get('/', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const referrals = await Referral.find({ inviterSellerId: req.user._id });
  res.json({ success: true, data: referrals });
}));

// Create a new referral
router.post('/', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const referral = await Referral.create({ ...req.body, inviterSellerId: req.user._id });
  res.status(201).json({ success: true, data: referral });
}));

module.exports = router; 