const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { getAll } = require("../models/Product");

const products = getAll();
const orders = [];

// POST /api/checkout
router.post("/", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const body = req.body;

  // Determine if payload came from simulated frontend
  const simulatedPayload = body.billing && body.paymentMethod;
  const items = body.items || [];
  const customer = simulatedPayload
    ? {
        name: body.billing.name,
        email: body.billing.email,
        address: body.billing.address || "N/A",
      }
    : body.customer;

  const payment = simulatedPayload
    ? { method: body.paymentMethod, last4: "0000" }
    : body.payment;

  if (!items.length)
    return res.status(400).json({ success: false, error: "Cart is empty" });

  // Validate items
  const productList = getAll();
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

  const orderId = `ORD-${Date.now()}-${uuidv4().slice(0, 8)}`;
  const order = {
    id: orderId,
    items,
    total: total.toFixed(2),
    customer,
    payment,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  orders.push(order);

  res.json({ success: true, data: order, message: "Order placed successfully" });
});

// GET /api/checkout/orders/:orderId
router.get("/orders/:orderId", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const order = orders.find((o) => o.id === req.params.orderId);
  if (!order)
    return res.status(404).json({ success: false, error: "Order not found" });
  res.json({ success: true, data: order });
});

module.exports = router;
