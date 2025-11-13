"use strict";
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const testEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com';
    const testPass = process.env.TEST_USER_PASSWORD || 'password123';

    // check if exists
    const exists = await queryInterface.rawSelect('users', {
      where: { email: testEmail }
    }, ['id']);
    if (exists) return;

    const hash = await bcrypt.hash(testPass, 10);
    // Determine which column name is present in the users table (password_hash vs passwordHash)
    let pwField = 'passwordHash';
    try {
      const desc = await queryInterface.describeTable('users');
      if (desc && typeof desc === 'object') {
        if (desc.password_hash) pwField = 'password_hash';
        else if (desc.passwordHash) pwField = 'passwordHash';
      }
    } catch (e) {
      // ignore and fall back to camelCase
    }

    const row = { name: 'Test User', email: testEmail };
    row[pwField] = hash;
    await queryInterface.bulkInsert('users', [row], {});
  },

  async down(queryInterface) {
    const testEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com';
    await queryInterface.bulkDelete('users', { email: testEmail }, {});
  }
};
