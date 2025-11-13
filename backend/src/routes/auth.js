const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const { Op } = require('sequelize');
const { authMiddleware } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ success: false, error: 'name, email and password required' });
  if (!User) return res.status(500).json({ success: false, error: 'User model not configured' });
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ success: false, error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({ name, email, passwordHash: hash });
    const token = generateToken({ id: u.id, email: u.email, name: u.name });
    // set HttpOnly cookie
    const cookieOpts = { httpOnly: true, sameSite: 'lax' };
    if (process.env.COOKIE_SECURE === 'true') cookieOpts.secure = true;
    res.cookie('auth_token', token, cookieOpts);
    res.json({ success: true, data: { id: u.id, email: u.email, name: u.name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, error: 'email and password required' });
  if (!User) return res.status(500).json({ success: false, error: 'User model not configured' });
  try {
    const u = await User.findOne({ where: { email } });
    if (!u) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const token = generateToken({ id: u.id, email: u.email, name: u.name });
    const cookieOpts = { httpOnly: true, sameSite: 'lax' };
    if (process.env.COOKIE_SECURE === 'true') cookieOpts.secure = true;
    res.cookie('auth_token', token, cookieOpts);
    res.json({ success: true, data: { id: u.id, email: u.email, name: u.name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// POST /api/auth/logout - if test user, clear their orders
// POST /api/auth/logout - clear user's orders for test user (if applicable) and clear auth cookie
router.post('/logout', authMiddleware, async (req, res) => {
  const testEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com';
  try {
    if (req.user && req.user.email === testEmail) {
      if (Order) {
        const userOrders = await Order.findAll({ where: { userId: req.user.id }, attributes: ['id'] });
        const ids = userOrders.map(o => o.id);
        if (ids.length) {
          await OrderItem.destroy({ where: { orderId: { [Op.in]: ids } } });
          await Order.destroy({ where: { id: { [Op.in]: ids } } });
        }
      }
    }
    // Clear auth cookie
    res.clearCookie('auth_token');
    return res.json({ success: true, message: 'Logged out' });
  } catch (e) {
    console.error('Logout cleanup failed', e.message);
    return res.status(500).json({ success: false, error: 'Logout cleanup failed' });
  }
});

  // GET /api/auth/me
  router.get('/me', authMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
    res.json({ success: true, data: { id: req.user.id, email: req.user.email, name: req.user.name } });
  });

module.exports = router;

