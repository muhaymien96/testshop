const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

let CartItem = null;
if (sequelize) {
  CartItem = sequelize.define('CartItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cartId: { type: DataTypes.INTEGER, allowNull: false, field: 'cart_id' },
  productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    price: { type: DataTypes.FLOAT }
  }, {
    tableName: 'cart_items',
    timestamps: false,
  });
}

module.exports = CartItem;
