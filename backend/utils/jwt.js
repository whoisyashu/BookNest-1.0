const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = '7d';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function generateSellerTokenPayload(seller) {
  return {
    id: seller._id,
    email: seller.email,
    role: 'seller',
    name: seller.name
  };
}

function generateBuyerTokenPayload(buyer) {
  return {
    id: buyer._id,
    email: buyer.email,
    role: 'buyer',
    name: buyer.name
  };
}

function generateAdminTokenPayload(admin) {
  return {
    id: admin._id,
    email: admin.email,
    role: 'admin',
    name: admin.name
  };
}

module.exports = {
  generateToken,
  generateSellerTokenPayload,
  generateBuyerTokenPayload,
  generateAdminTokenPayload
}; 