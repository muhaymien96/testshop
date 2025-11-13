const bcrypt = require('bcrypt');
const { connect, sequelize } = require('../src/db');
const User = require('../src/models/User');

async function seed() {
  if (!sequelize) {
    console.error('No DB configured. Set DATABASE_URL or DB_HOST/DB_USER/DB_PASS/DB_NAME');
    process.exit(1);
  }
  await connect();
  try {
    await sequelize.sync();

    const testEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com';
    const testPass = process.env.TEST_USER_PASSWORD || 'password123';

    // Check if user exists
    const existing = await User.findOne({ where: { email: testEmail } });
    if (existing) {
      console.log('Test user already exists:', testEmail);
      process.exit(0);
    }

    const hash = await bcrypt.hash(testPass, 10);
    await User.create({ name: 'Test User', email: testEmail, passwordHash: hash });
    console.log(`Created test user ${testEmail} (password: ${testPass})`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding users failed', err);
    process.exit(1);
  }
}

seed();
