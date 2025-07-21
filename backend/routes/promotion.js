const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const Promotion = require('../models/Promotion');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Public: Get all promotions
router.get('/', asyncHandler(async (req, res) => {
  const promotions = await Promotion.find({ isActive: true });
  res.json({ success: true, data: promotions });
}));

// Public: Get promotion by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const promo = await Promotion.findById(req.params.id);
  if (!promo || !promo.isActive) return res.status(404).json({ success: false, message: 'Promotion not found' });
  res.json({ success: true, data: promo });
}));

// Protected: Create promotion (Seller/Admin)
router.post('/', protect, authorizeRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  const promo = await Promotion.create(req.body);
  res.status(201).json({ success: true, data: promo });
}));

// Protected: Update promotion (Seller/Admin, owner or admin)
router.put('/:id', protect, authorizeRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!promo) return res.status(404).json({ success: false, message: 'Promotion not found' });
  res.json({ success: true, data: promo });
}));

// Protected: Delete promotion (Seller/Admin, owner or admin)
router.delete('/:id', protect, authorizeRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  const promo = await Promotion.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!promo) return res.status(404).json({ success: false, message: 'Promotion not found' });
  res.json({ success: true, message: 'Promotion deleted' });
}));

module.exports = router; 