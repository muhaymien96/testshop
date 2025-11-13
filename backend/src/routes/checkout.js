const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { getAll } = require("../models/Product");
const { Order, OrderItem, User } = require('../models');
const { Op } = require('sequelize');
const { authMiddleware } = require('../middleware/auth');

// do not call getAll() at module load time (may be async); call inside handlers
const orders = []; // local fallback if DB not configured

// POST /api/checkout (requires authentication)
router.post("/", authMiddleware, async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const body = req.body;

  // Determine if payload came from simulated frontend
  const simulatedPayload = body.billing && body.paymentMethod;
  const items = body.items || [];
  // when auth is required, prefer authenticated user info
  const customer = simulatedPayload
    ? {
        name: body.billing.name,
        email: body.billing.email,
        address: body.billing.address || "N/A",
      }
    : (req.user ? { name: req.user.name, email: req.user.email } : body.customer);

  const payment = simulatedPayload
    ? { method: body.paymentMethod, last4: "0000" }
    : body.payment;

  if (!items.length)
    return res.status(400).json({ success: false, error: "Cart is empty" });

  // Validate items
  const productList = await getAll();
  for (const item of items) {
    const product = productList.find(
      (p) => p.id === item.id || p.id === item.productId
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, error: `Product ${item.id} not found` });
  }

  // Calculate total
  const total = items.reduce((sum, item) => {
    const product = productList.find(
      (p) => p.id === item.id || p.id === item.productId
    );
    return sum + product.price * (item.qty || item.quantity || 1);
  }, 0);

  // Simulate random failures (5%)
  if (Math.random() < 0.05)
    return res.status(402).json({ success: false, error: "Payment declined" });

  // persist to DB if available
  if (Order && OrderItem) {
    try {
      // Create DB-backed order (id is auto-increment integer in the DB)
      const created = await Order.create({ userId: req.user ? req.user.id : null, total: parseFloat(total.toFixed(2)), status: 'confirmed', paymentMethod: payment.method });
      // create items referencing the created order id
      for (const it of items) {
        const pid = it.id || it.productId;
        const prod = productList.find(p => p.id === pid) || {};
        const qty = it.qty || it.quantity || 1;
        const price = prod.price || 0;
        await OrderItem.create({ orderId: created.id, productId: pid, quantity: qty, priceEach: price, subtotal: price * qty });
      }

      // fetch order with included items to return to client
      const o = await Order.findByPk(created.id, { include: [{ model: OrderItem, as: 'items' }, { model: User, as: 'user', attributes: ['id', 'name', 'email'] }] });
      return res.json({ success: true, data: o, message: 'Order placed successfully' });
    } catch (e) {
      console.warn('Failed to persist order to DB', e.message);
      // fall through to local fallback response
    }
  }

  // local fallback (if DB not available)
  const order = {
    id: `TEMP-${Date.now()}`,
    items,
    total: total.toFixed(2),
    customer,
    payment,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  res.json({ success: true, data: order, message: 'Order placed (local fallback)' });
});

// GET /api/checkout/orders/:orderId
router.get("/orders/:orderId", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  // Try DB first if models configured
  if (Order) {
    try {
      const o = await Order.findByPk(req.params.orderId, {
        include: [
          { model: OrderItem, as: 'items' },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        ],
      });
      if (o) return res.json({ success: true, data: o });
      // If DB model exists but no row found, fall back to local in-memory orders
    } catch (e) {
      console.warn('Error querying DB for order', e.message);
      // continue to local fallback
    }
  }

  const order = orders.find((o) => o.id === req.params.orderId);
  if (!order)
    return res.status(404).json({ success: false, error: "Order not found" });
  res.json({ success: true, data: order });
});

// GET /api/checkout/my-orders (protected)
router.get('/my-orders', authMiddleware, async (req, res) => {
  if (!Order) return res.json({ success: true, data: orders });
  const rows = await Order.findAll({ where: { userId: req.user.id }, include: [{ model: OrderItem, as: 'items' }] });
  res.json({ success: true, data: rows });
});

// DELETE /api/checkout/my-orders (protected) - remove all orders for current user
router.delete('/my-orders', authMiddleware, async (req, res) => {
  if (!Order) {
    // local fallback: remove orders belonging to this user's email if possible
    const email = req.user && req.user.email;
    if (!email) return res.status(400).json({ success: false, error: 'Cannot identify user to delete orders' });
    for (let i = orders.length - 1; i >= 0; i--) {
      const o = orders[i];
      if (o.customer && (o.customer.email === email || o.customer.email === req.user.email)) {
        orders.splice(i, 1);
      }
    }
    return res.json({ success: true, message: 'Orders cleared (local)' });
  }

  try {
    // Find user's orders
    const userOrders = await Order.findAll({ where: { userId: req.user.id }, attributes: ['id'] });
    const ids = userOrders.map(o => o.id);
    if (ids.length) {
      await OrderItem.destroy({ where: { orderId: { [Op.in]: ids } } });
      await Order.destroy({ where: { id: { [Op.in]: ids } } });
    }
    return res.json({ success: true, message: 'Orders cleared' });
  } catch (e) {
    console.error('Failed to delete orders for user', e.message);
    return res.status(500).json({ success: false, error: 'Failed to clear orders' });
  }
});

module.exports = router;
