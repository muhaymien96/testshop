const express = require('express');
const router = express.Router();
const products = require('../data/products.json');

let requestCount = 0;

// Middleware to count requests
router.use((req, res, next) => {
  requestCount++;
  next();
});

// GET /api/admin/metrics
router.get('/metrics', async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 100));

  // This would typically come from a database
  const metrics = {
    totalProducts: products.length,
    totalOrders: 0, // Would query orders
    totalRequests: requestCount,
    averageOrderValue: 0,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };

  res.json({
    success: true,
    data: metrics
  });
});

// GET /api/admin/docs
router.get('/docs', (req, res) => {
  const docs = {
    title: 'E-Commerce Test Automation API',
    version: '1.0.0',
    endpoints: [
      {
        method: 'GET',
        path: '/api/products',
        description: 'Get all products with optional filters',
        queryParams: ['category', 'search', 'minPrice', 'maxPrice', 'sortBy']
      },
      {
        method: 'GET',
        path: '/api/products/:id',
        description: 'Get product by ID'
      },
      {
        method: 'GET',
        path: '/api/products/meta/categories',
        description: 'Get all categories'
      },
      {
        method: 'POST',
        path: '/api/cart/add',
        description: 'Add item to cart',
        body: { sessionId: 'string', productId: 'number', quantity: 'number' }
      },
      {
        method: 'GET',
        path: '/api/cart/:sessionId',
        description: 'Get cart by session ID'
      },
      {
        method: 'POST',
        path: '/api/checkout',
        description: 'Process checkout',
        body: { items: 'array', customer: 'object', payment: 'object' }
      },
      {
        method: 'GET',
        path: '/api/checkout/orders/:orderId',
        description: 'Get order by ID'
      },
      {
        method: 'GET',
        path: '/api/admin/metrics',
        description: 'Get system metrics'
      },
      {
        method: 'GET',
        path: '/api/health',
        description: 'Health check endpoint'
      }
    ]
  };

  res.json(docs);
});

module.exports = router;