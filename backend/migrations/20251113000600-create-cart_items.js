"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cart_items', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      cartId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'carts', key: 'id' }, onDelete: 'CASCADE' },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'SET NULL' },
      quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
      price: { type: Sequelize.FLOAT }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('cart_items');
  }
};
