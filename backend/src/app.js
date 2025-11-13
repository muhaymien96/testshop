const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const checkoutRouter = require('./routes/checkout');
const adminRouter = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;
const { connect } = require('./db');

// Middleware
app.use(helmet());
// CORS - allow frontend origin and credentials so cookies are sent
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);

// Ensure session cookie exists for anonymous carts
app.use((req, res, next) => {
  try {
    if (!req.cookies || !req.cookies.session_id) {
      const id = require('crypto').randomUUID();
      // httpOnly so it's sent automatically by browser but not readable from JS
      res.cookie('session_id', id, { httpOnly: true, sameSite: 'lax' });
      req.sessionId = id;
    } else {
      req.sessionId = req.cookies.session_id;
    }
  } catch (e) {
    // fallback: generate a non-cookie session id on the request object
    if (!req.sessionId) req.sessionId = `sess_${Math.random().toString(36).slice(2,10)}`;
  }
  next();
});

// Routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/admin/docs`);
  // Try to connect to database if configured
  connect().then(ok => {
    if (!ok) console.log('ℹ️ Database not connected (running in file-backed mode)');
  });
});

module.exports = app;

