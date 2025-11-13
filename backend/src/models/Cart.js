const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

let Cart = null;
if (sequelize) {
  Cart = sequelize.define('Cart', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // DB uses `sessionId` column for guest sessions (camelCase in your DB)
    sessionId: { type: DataTypes.STRING, allowNull: true, unique: true, field: 'sessionId' },
    userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'createdAt' },
    updatedAt: { type: DataTypes.DATE, field: 'updatedAt' }
  }, {
    tableName: 'carts',
    timestamps: false,
  });
}

module.exports = Cart;
