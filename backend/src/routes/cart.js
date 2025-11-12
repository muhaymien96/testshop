const express = require("express");
const router = express.Router();
const { getAll } = require("../models/Product");

const products = getAll();
const carts = new Map();

// POST /api/cart/add
router.post("/add", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const { sessionId, productId, quantity = 1 } = req.body;
  if (!sessionId || !productId)
    return res
      .status(400)
      .json({ success: false, error: "sessionId and productId required" });

  const product = products.find((p) => p.id === parseInt(productId));
  if (!product)
    return res.status(404).json({ success: false, error: "Product not found" });

  const cart = carts.get(sessionId) || [];
  const existing = cart.find((c) => c.productId === productId);
  if (existing) existing.quantity += quantity;
  else cart.push({ productId, quantity });

  carts.set(sessionId, cart);

  res.json({ success: true, data: { sessionId, productId, quantity } });
});

// GET /api/cart/:sessionId
router.get("/:sessionId", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const cart = carts.get(req.params.sessionId) || [];
  const detailed = cart.map((c) => {
    const product = products.find((p) => p.id === c.productId);
    return {
      ...c,
      product,
      subtotal: product.price * c.quantity,
    };
  });
  const total = detailed.reduce((s, i) => s + i.subtotal, 0);
  res.json({
    success: true,
    data: { items: detailed, total: total.toFixed(2), count: cart.length },
  });
});

// DELETE /api/cart/:sessionId
router.delete("/:sessionId", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  carts.delete(req.params.sessionId);
  res.json({ success: true, message: "Cart cleared" });
});

module.exports = router;
