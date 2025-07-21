const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');
const Admin = require('../models/Admin');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

// General protect middleware
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new UnauthorizedError('Not authorized, token missing'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    let user = null;
    let role = null;
    if (decoded.role === 'seller') {
      user = await Seller.findById(decoded.id);
      role = 'seller';
    } else if (decoded.role === 'buyer') {
      user = await Buyer.findById(decoded.id);
      role = 'buyer';
    } else if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id);
      role = 'admin';
    }
    if (!user) {
      return next(new UnauthorizedError('User not found'));
    }
    req.user = user;
    req.role = role;
    next();
  } catch (err) {
    return next(new UnauthorizedError('Not authorized, token failed'));
  }
};

// Role-based authorization
exports.authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.role)) {
    return next(new ForbiddenError('You do not have permission to perform this action'));
  }
  next();
}; 