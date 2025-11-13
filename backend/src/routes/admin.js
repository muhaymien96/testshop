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
    note: 'This project uses server-side HttpOnly cookies for auth (cookie name `auth_token`) and a server session cookie for carts (cookie name `session_id`). When testing from a browser or automation runner, ensure requests include credentials (cookies).',
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
        description: 'Add item to cart. Server identifies the session using the HttpOnly `session_id` cookie; authenticated users will have their carts associated with their account.',
        body: { productId: 'number', quantity: 'number' }
      },
      {
        method: 'POST',
        path: '/api/cart/update',
        description: 'Update quantity of an item in the current session cart',
        body: { productId: 'number', quantity: 'number' }
      },
      {
        method: 'GET',
        path: '/api/cart',
        description: 'Get cart for current session (reads `session_id` cookie)'
      },
      {
        method: 'DELETE',
        path: '/api/cart',
        description: 'Clear cart for current session'
      },
      {
        method: 'POST',
        path: '/api/checkout',
        description: 'Process checkout. Requires authentication. Server will use the authenticated user (or session) to create an order.',
        body: { items: 'array', total: 'number', billing: 'object', paymentMethod: 'string' }
      },
      {
        method: 'GET',
        path: '/api/checkout/my-orders',
        description: 'Get orders for the authenticated user (requires auth cookie)'
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
        path: '/api/auth/me',
        description: 'Return the currently authenticated user (reads HttpOnly `auth_token` cookie)'
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Login — sets an HttpOnly cookie `auth_token` on success'
      },
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register — sets an HttpOnly cookie `auth_token` on success'
      },
      {
        method: 'POST',
        path: '/api/auth/logout',
        description: 'Logout — clears the auth cookie and optional test-user cleanup'
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