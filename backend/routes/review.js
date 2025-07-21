const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const Review = require('../models/Review');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Public: Get all reviews for a book
router.get('/book/:bookId', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ bookId: req.params.bookId });
  res.json({ success: true, data: reviews });
}));

// Public: Get a review by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  res.json({ success: true, data: review });
}));

// Protected: Add a review (buyer only, one per book)
router.post('/', protect, authorizeRoles('buyer'), asyncHandler(async (req, res) => {
  const { bookId, rating, comment, images } = req.body;
  // Ensure only one review per buyer per book
  const existing = await Review.findOne({ bookId, buyerId: req.user._id });
  if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this book' });
  const review = await Review.create({ bookId, buyerId: req.user._id, rating, comment, images });
  res.status(201).json({ success: true, data: review });
}));

// Protected: Update a review (buyer only, only their own)
router.put('/:id', protect, authorizeRoles('buyer'), asyncHandler(async (req, res) => {
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, buyerId: req.user._id },
    req.body,
    { new: true }
  );
  if (!review) return res.status(404).json({ success: false, message: 'Review not found or not yours' });
  res.json({ success: true, data: review });
}));

// Protected: Delete a review (buyer only, only their own)
router.delete('/:id', protect, authorizeRoles('buyer'), asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, buyerId: req.user._id });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found or not yours' });
  res.json({ success: true, message: 'Review deleted' });
}));

module.exports = router; 