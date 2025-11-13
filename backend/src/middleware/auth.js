const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET || 'dev_secret_change_me';

function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  // Accept token from Authorization header or HttpOnly cookie 'auth_token'
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies && req.cookies.auth_token;
  const token = authHeader && authHeader.split && authHeader.split(' ')[0] === 'Bearer' ? authHeader.split(' ')[1] : cookieToken;
  if (!token) return res.status(401).json({ success: false, error: 'Missing auth token' });
  try {
    const payload = jwt.verify(token, secret);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

module.exports = { authMiddleware, generateToken };
