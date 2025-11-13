const express = require("express");
const router = express.Router();
const { getAll, getById } = require("../models/Product");
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const { sequelize } = require('../db');
const carts = new Map();

// POST /api/cart/add
router.post("/add", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let { sessionId, productId, quantity = 1 } = req.body;
  sessionId = sessionId || req.params.sessionId || req.sessionId;
  if (!sessionId || !productId)
    return res
      .status(400)
      .json({ success: false, error: "sessionId and productId required" });
  // validate product exists (try DB then JSON)
  let product = null;
  try {
    product = await getById(productId);
  } catch (e) {
    // ignore
  }
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

  // if DB models available, persist cart
  if (Cart && CartItem && sequelize) {
    try {
      // find or create cart
      const [cartRow] = await Cart.findOrCreate({ where: { sessionId }, defaults: { sessionId } });
      // find existing item
      const existing = await CartItem.findOne({ where: { cartId: cartRow.id, productId } });
      if (existing) {
        existing.quantity = existing.quantity + quantity;
        await existing.save();
      } else {
        await CartItem.create({ cartId: cartRow.id, productId, quantity, price: product.price });
      }
      return res.json({ success: true, data: { sessionId, productId, quantity } });
    } catch (e) {
      console.warn('DB cart persist failed', e.message);
      // fallback to in-memory
    }
  }

  // in-memory fallback
  const cart = carts.get(sessionId) || [];
  const existing = cart.find((c) => c.productId === productId);
  if (existing) existing.quantity += quantity;
  else cart.push({ productId, quantity });

  carts.set(sessionId, cart);

  res.json({ success: true, data: { sessionId, productId, quantity } });
});

// POST /api/cart/update - set quantity for a product in the cart (or remove if quantity <= 0)
router.post('/update', async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  let { sessionId, productId, quantity = 0 } = req.body;
  sessionId = sessionId || req.params.sessionId || req.sessionId;
  if (!sessionId || typeof productId === 'undefined') return res.status(400).json({ success: false, error: 'sessionId and productId required' });

  // validate product exists
  let product = null;
  try { product = await getById(productId); } catch (e) { }
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

  if (Cart && CartItem && sequelize) {
    try {
      const [cartRow] = await Cart.findOrCreate({ where: { sessionId }, defaults: { sessionId } });
      const existing = await CartItem.findOne({ where: { cartId: cartRow.id, productId } });
      if (quantity <= 0) {
        if (existing) await existing.destroy();
      } else {
        if (existing) {
          existing.quantity = quantity;
          await existing.save();
        } else {
          await CartItem.create({ cartId: cartRow.id, productId, quantity, price: product.price });
        }
      }
      return res.json({ success: true, data: { sessionId, productId, quantity } });
    } catch (e) {
      console.warn('DB cart update failed', e.message);
      // fallback to in-memory
    }
  }

  // in-memory fallback
  const cart = carts.get(sessionId) || [];
  const idx = cart.findIndex(c => String(c.productId) === String(productId));
  if (quantity <= 0) {
    if (idx >= 0) cart.splice(idx, 1);
  } else {
    if (idx >= 0) cart[idx].quantity = quantity;
    else cart.push({ productId, quantity });
  }
  carts.set(sessionId, cart);
  res.json({ success: true, data: { sessionId, productId, quantity } });
});

// GET /api/cart/:sessionId
router.get("/:sessionId", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const sessionId = req.params.sessionId;

  // try DB-backed cart
  if (Cart && CartItem && sequelize) {
    try {
      const cartRow = await Cart.findOne({ where: { sessionId }, raw: true });
      if (!cartRow) return res.json({ success: true, data: { items: [], total: '0.00', count: 0 } });
      const items = await CartItem.findAll({ where: { cartId: cartRow.id }, raw: true });
      const detailed = [];
      let total = 0;
      for (const it of items) {
        const product = await getById(it.productId);
        const subtotal = (product?.price || 0) * it.quantity;
        total += subtotal;
        detailed.push({ productId: it.productId, quantity: it.quantity, product, subtotal });
      }
      return res.json({ success: true, data: { items: detailed, total: total.toFixed(2), count: detailed.length } });
    } catch (e) {
      console.warn('DB cart read failed', e.message);
      // fallback
    }
  }

  const cart = carts.get(sessionId) || [];
  const detailed = [];
  let total = 0;
  for (const c of cart) {
    const product = (await getById(c.productId)) || null;
    const subtotal = (product?.price || 0) * c.quantity;
    total += subtotal;
    detailed.push({ productId: c.productId, quantity: c.quantity, product, subtotal });
  }
  res.json({ success: true, data: { items: detailed, total: total.toFixed(2), count: cart.length } });
});

// GET /api/cart (use cookie/session)
router.get('/', async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const sessionId = req.sessionId;
  if (!sessionId) return res.json({ success: true, data: { items: [], total: '0.00', count: 0 } });

  // reuse logic from above
  if (Cart && CartItem && sequelize) {
    try {
      const cartRow = await Cart.findOne({ where: { sessionId }, raw: true });
      if (!cartRow) return res.json({ success: true, data: { items: [], total: '0.00', count: 0 } });
      const items = await CartItem.findAll({ where: { cartId: cartRow.id }, raw: true });
      const detailed = [];
      let total = 0;
      for (const it of items) {
        const product = await getById(it.productId);
        const subtotal = (product?.price || 0) * it.quantity;
        total += subtotal;
        detailed.push({ productId: it.productId, quantity: it.quantity, product, subtotal });
      }
      return res.json({ success: true, data: { items: detailed, total: total.toFixed(2), count: detailed.length } });
    } catch (e) {
      console.warn('DB cart read failed', e.message);
      // fallback
    }
  }

  const cart = carts.get(sessionId) || [];
  const detailed = [];
  let total = 0;
  for (const c of cart) {
    const product = (await getById(c.productId)) || null;
    const subtotal = (product?.price || 0) * c.quantity;
    total += subtotal;
    detailed.push({ productId: c.productId, quantity: c.quantity, product, subtotal });
  }
  res.json({ success: true, data: { items: detailed, total: total.toFixed(2), count: cart.length } });
});

// DELETE /api/cart/:sessionId
router.delete("/:sessionId", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const sessionId = req.params.sessionId || req.sessionId;
  if (Cart && CartItem && sequelize) {
    try {
      const cartRow = await Cart.findOne({ where: { sessionId }, raw: true });
      if (cartRow) {
        await CartItem.destroy({ where: { cartId: cartRow.id } });
        await Cart.destroy({ where: { id: cartRow.id } });
      }
      return res.json({ success: true, message: 'Cart cleared' });
    } catch (e) {
      console.warn('DB clear failed', e.message);
      // fallback
    }
  }
  carts.delete(sessionId);
  res.json({ success: true, message: "Cart cleared" });
});

// DELETE /api/cart - clear current session cart
router.delete('/', async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const sessionId = req.sessionId;
  if (!sessionId) return res.json({ success: true, message: 'Cart cleared' });
  if (Cart && CartItem && sequelize) {
    try {
      const cartRow = await Cart.findOne({ where: { sessionId }, raw: true });
      if (cartRow) {
        await CartItem.destroy({ where: { cartId: cartRow.id } });
        await Cart.destroy({ where: { id: cartRow.id } });
      }
      return res.json({ success: true, message: 'Cart cleared' });
    } catch (e) {
      console.warn('DB clear failed', e.message);
    }
  }
  carts.delete(sessionId);
  res.json({ success: true, message: "Cart cleared" });
});

module.exports = router;
