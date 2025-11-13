"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      price: { type: Sequelize.FLOAT, allowNull: false },
      category: { type: Sequelize.STRING },
      stock: { type: Sequelize.INTEGER, defaultValue: 0 },
      image: { type: Sequelize.STRING },
      description: { type: Sequelize.TEXT },
      sku: { type: Sequelize.STRING, unique: true, allowNull: true }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  }
};
