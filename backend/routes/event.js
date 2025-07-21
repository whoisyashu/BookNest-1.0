const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const Event = require('../models/Event');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Public: Get all events
router.get('/', asyncHandler(async (req, res) => {
  const events = await Event.find({ isActive: true });
  res.json({ success: true, data: events });
}));

// Public: Get event by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event || !event.isActive) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, data: event });
}));

// Protected: Create event (Seller/Admin)
router.post('/', protect, authorizeRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, publisherId: req.user._id });
  res.status(201).json({ success: true, data: event });
}));

// Protected: Update event (Seller/Admin, owner or admin)
router.put('/:id', protect, authorizeRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  const filter = req.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, publisherId: req.user._id };
  const event = await Event.findOneAndUpdate(filter, req.body, { new: true });
  if (!event) return res.status(404).json({ success: false, message: 'Event not found or not yours' });
  res.json({ success: true, data: event });
}));

// Protected: Delete event (Seller/Admin, owner or admin)
router.delete('/:id', protect, authorizeRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  const filter = req.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, publisherId: req.user._id };
  const event = await Event.findOneAndUpdate(filter, { isActive: false }, { new: true });
  if (!event) return res.status(404).json({ success: false, message: 'Event not found or not yours' });
  res.json({ success: true, message: 'Event deleted' });
}));

module.exports = router; 