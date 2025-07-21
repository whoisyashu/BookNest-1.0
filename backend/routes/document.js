const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const Document = require('../models/Document');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Seller: Get all their documents
router.get('/', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const docs = await Document.find({ sellerId: req.user._id });
  res.json({ success: true, data: docs });
}));

// Get a specific document (seller owner or admin)
router.get('/:id', protect, authorizeRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc || (req.role === 'seller' && String(doc.sellerId) !== String(req.user._id))) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, data: doc });
}));

// Seller: Upload document
router.post('/', protect, authorizeRoles('seller'), asyncHandler(async (req, res) => {
  const doc = await Document.create({ ...req.body, sellerId: req.user._id });
  res.status(201).json({ success: true, data: doc });
}));

// Admin: Verify/reject document
router.put('/:id/verify', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const doc = await Document.findByIdAndUpdate(req.params.id, { verified: req.body.verified, verifiedBy: req.user._id, verifiedAt: Date.now(), rejectionReason: req.body.rejectionReason }, { new: true });
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  res.json({ success: true, data: doc });
}));

// Seller/Admin: Delete document
router.delete('/:id', protect, authorizeRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc || (req.role === 'seller' && String(doc.sellerId) !== String(req.user._id))) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  await doc.remove();
  res.json({ success: true, message: 'Document deleted' });
}));

module.exports = router; 