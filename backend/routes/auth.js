const express = require('express');
const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Seller Registration
router.post('/seller/register', async (req, res) => {
  try {
    console.debug('Seller registration request body:', req.body);
    const { name, email, password, phone } = req.body;
    const tierId = req.body.tierId || "687dc01d8735dc35e711917b";
    const seller = await Seller.create({ name, email, password, phone, tierId });
    const token = jwt.sign({ id: seller._id, role: 'seller' }, process.env.JWT_SECRET || 'secret');
    console.debug('Generated token for seller:', token);
    res.status(201).json({ success: true, token, seller });
  } catch (err) {
    console.debug('Seller registration error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// Seller Login
router.post('/seller/login', async (req, res) => {
  try {
    console.debug('Seller login request body:', req.body);
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller || !(await seller.comparePassword(password))) {
      console.debug('Seller login failed: Invalid credentials');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: seller._id, role: 'seller' }, process.env.JWT_SECRET || 'secret');
    console.debug('Generated token for seller:', token);
    res.json({ success: true, token, seller });
  } catch (err) {
    console.debug('Seller login error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// Buyer Registration
router.post('/buyer/register', async (req, res) => {
  try {
    console.debug('Buyer registration request body:', req.body);
    const { name, email, password, phone, username } = req.body;
    const buyer = await Buyer.create({ name, email, password, phone, username });
    const token = jwt.sign({ id: buyer._id, role: 'buyer' }, process.env.JWT_SECRET || 'secret');
    console.debug('Generated token for buyer:', token);
    res.status(201).json({ success: true, token, buyer });
  } catch (err) {
    console.debug('Buyer registration error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// Buyer Login
router.post('/buyer/login', async (req, res) => {
  try {
    console.debug('Buyer login request body:', req.body);
    const { email, password } = req.body;
    const buyer = await Buyer.findOne({ email });
    if (!buyer || !(await buyer.comparePassword(password))) {
      console.debug('Buyer login failed: Invalid credentials');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: buyer._id, role: 'buyer' }, process.env.JWT_SECRET || 'secret');
    console.debug('Generated token for buyer:', token);
    return res.json({ success: true, token, buyer });
  } catch (err) {
    console.debug('Buyer login error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get current buyer profile
const { protect } = require('../middleware/auth');
router.get('/buyer/profile', protect, async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user.id).select('-password');
    if (!buyer) {
      return res.status(404).json({ success: false, message: 'Buyer not found' });
    }
    res.json({ success: true, buyer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
