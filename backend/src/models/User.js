const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

let User = null;
if (sequelize) {
  User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    // DB has `password_hash`
    passwordHash: { type: DataTypes.STRING, allowNull: false, field: 'password_hash' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  }, {
    tableName: 'users',
    timestamps: false,
  });

}

module.exports = User;
