const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

let Order = null;
if (sequelize) {
  Order = sequelize.define('Order', {
    // DB has integer auto-increment PK for orders
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
    total: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: 'confirmed' },
    paymentMethod: { type: DataTypes.STRING, field: 'payment_method' },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  }, {
    tableName: 'orders',
    timestamps: false,
  });

}

module.exports = Order;
