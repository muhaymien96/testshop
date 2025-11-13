"use strict";
const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface) {
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
    let products = [];
    try {
      const raw = fs.readFileSync(dataPath, 'utf8');
      products = JSON.parse(raw);
    } catch (e) {
      console.warn('Products JSON not found or invalid; seeding empty set');
    }

    if (products.length) {
      // map to fields expected by products table
      const rows = products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        stock: p.stock || 0,
        image: p.image || null,
        description: p.description || null,
        sku: p.sku || null
      }));

      // Make seeder idempotent: skip rows that already exist to avoid duplicate key errors
      try {
        const ids = rows.map(r => r.id);
        const placeholders = ids.map(() => '?').join(',');
        const [existing] = await queryInterface.sequelize.query(
          `SELECT id FROM products WHERE id IN (${placeholders})`, { replacements: ids }
        );
        const existingIds = new Set(existing.map((r) => r.id));
        const toInsert = rows.filter(r => !existingIds.has(r.id));
        if (toInsert.length) {
          await queryInterface.bulkInsert('products', toInsert, {});
        } else {
          console.log('Products seeder: no new rows to insert');
        }
      } catch (e) {
        console.warn('Products seeder error (falling back to bulkInsert):', e.message);
        // fallback: attempt bulk insert (may error if duplicates present)
        await queryInterface.bulkInsert('products', rows, {});
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {});
  }
};
