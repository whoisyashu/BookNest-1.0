const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const Recommendation = require('../models/Recommendation');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Get all recommendations for current user (buyer only)
router.get('/', protect, authorizeRoles('buyer'), asyncHandler(async (req, res) => {
  const recs = await Recommendation.find({ userId: req.user._id });
  res.json({ success: true, data: recs });
}));

// Get a specific recommendation by ID (buyer only, must be owner)
router.get('/:id', protect, authorizeRoles('buyer'), asyncHandler(async (req, res) => {
  const rec = await Recommendation.findOne({ _id: req.params.id, userId: req.user._id });
  if (!rec) return res.status(404).json({ success: false, message: 'Recommendation not found' });
  res.json({ success: true, data: rec });
}));

// Create or update recommendations for user (buyer only)
router.post('/', protect, authorizeRoles('buyer'), asyncHandler(async (req, res) => {
  const { books } = req.body;
  let rec = await Recommendation.findOneAndUpdate(
    { userId: req.user._id },
    { books, generatedAt: Date.now() },
    { new: true, upsert: true }
  );
  res.status(201).json({ success: true, data: rec });
}));

// Delete a recommendation (buyer only, must be owner)
router.delete('/:id', protect, authorizeRoles('buyer'), asyncHandler(async (req, res) => {
  const rec = await Recommendation.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!rec) return res.status(404).json({ success: false, message: 'Recommendation not found' });
  res.json({ success: true, message: 'Recommendation deleted' });
}));

module.exports = router; 