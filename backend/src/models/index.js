const { sequelize } = require('../db');

// Import models so they register with Sequelize
const User = require('./User');
const Product = require('./Product');
const ProductModel = require('./ProductModel');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Define associations centrally to avoid require-order issues
try {
  if (User && Order) {
    // associations use attribute names (camelCase) while models map to DB fields where needed
    User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
    Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  }

  if (Order && OrderItem) {
    Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
    OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
  }

  if (Cart && CartItem) {
    Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
    CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
  }
} catch (e) {
  // ignore — models may be partially defined when this file is required
}

module.exports = {
  sequelize,
  User,
  Product,
  ProductModel,
  Cart,
  CartItem,
  Order,
  OrderItem,
};
