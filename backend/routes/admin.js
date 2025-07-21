const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const Admin = require('../models/Admin');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Get all admins
router.get('/', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const admins = await Admin.find();
  res.json({ success: true, data: admins });
}));

// Get admin by ID
router.get('/:id', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
  res.json({ success: true, data: admin });
}));

// Create admin
router.post('/', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const admin = await Admin.create(req.body);
  res.status(201).json({ success: true, data: admin });
}));

// Update admin
router.put('/:id', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
  res.json({ success: true, data: admin });
}));

// Deactivate admin
router.delete('/:id', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
  res.json({ success: true, message: 'Admin deactivated' });
}));

module.exports = router; 