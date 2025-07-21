const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const OnboardingStatus = require('../models/OnboardingStatus');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Get all onboarding steps for seller
router.get('/', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const steps = await OnboardingStatus.find({ sellerId: req.user._id });
  res.json({ success: true, data: steps });
}));

// Get a specific onboarding step
router.get('/:id', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const step = await OnboardingStatus.findOne({ _id: req.params.id, sellerId: req.user._id });
  if (!step) return res.status(404).json({ success: false, message: 'Step not found' });
  res.json({ success: true, data: step });
}));

// Update onboarding step
router.put('/:id', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const step = await OnboardingStatus.findOneAndUpdate({ _id: req.params.id, sellerId: req.user._id }, req.body, { new: true });
  if (!step) return res.status(404).json({ success: false, message: 'Step not found' });
  res.json({ success: true, data: step });
}));

module.exports = router; 