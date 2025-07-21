const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const BarterRequest = require('../models/BarterRequest');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Get all barter requests for current user (buyer or seller)
router.get('/', protect, authorizeRoles('buyer', 'seller'), asyncHandler(async (req, res) => {
  const filter = req.role === 'buyer' ? { initiatorId: req.user._id } : { targetUserId: req.user._id };
  const requests = await BarterRequest.find(filter);
  res.json({ success: true, data: requests });
}));

// Get a specific barter request (must be involved)
router.get('/:id', protect, authorizeRoles('buyer', 'seller'), asyncHandler(async (req, res) => {
  const request = await BarterRequest.findById(req.params.id);
  if (!request || (String(request.initiatorId) !== String(req.user._id) && String(request.targetUserId) !== String(req.user._id))) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, data: request });
}));

// Create a new barter request (buyer only)
router.post('/', protect, authorizeRoles('buyer'), asyncHandler(async (req, res) => {
  const barter = await BarterRequest.create({ ...req.body, initiatorId: req.user._id });
  res.status(201).json({ success: true, data: barter });
}));

// Update barter request status (seller only, must be target)
router.put('/:id/status', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const request = await BarterRequest.findOneAndUpdate(
    { _id: req.params.id, targetUserId: req.user._id },
    { status: req.body.status, statusUpdatedAt: Date.now() },
    { new: true }
  );
  if (!request) return res.status(404).json({ success: false, message: 'Barter request not found or not yours' });
  res.json({ success: true, data: request });
}));

// Cancel barter request (buyer only, must be initiator)
router.delete('/:id', protect, authorizeRoles('buyer'), asyncHandler(async (req, res) => {
  const request = await BarterRequest.findOneAndUpdate(
    { _id: req.params.id, initiatorId: req.user._id },
    { status: 'cancelled', statusUpdatedAt: Date.now() },
    { new: true }
  );
  if (!request) return res.status(404).json({ success: false, message: 'Barter request not found or not yours' });
  res.json({ success: true, message: 'Barter request cancelled' });
}));

module.exports = router; 