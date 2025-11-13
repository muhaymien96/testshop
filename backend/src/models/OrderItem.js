const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

let OrderItem = null;
if (sequelize) {
  OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // DB uses integer foreign key to orders.id
    orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
    productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    // DB column name is price_each
    priceEach: { type: DataTypes.DECIMAL(10,2), field: 'price_each' },
    subtotal: { type: DataTypes.DECIMAL(10,2), field: 'subtotal' }
  }, {
    tableName: 'order_items',
    timestamps: false,
  });
}

module.exports = OrderItem;
