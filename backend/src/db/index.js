const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use DATABASE_URL if provided (recommended), otherwise build from individual vars
const databaseUrl = process.env.DATABASE_URL;
let sequelize = null;
let connected = false;

if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
  });
} 

async function connect() {
  if (!sequelize) return false;
  try {
    await sequelize.authenticate();
    connected = true;
    // If you want to sync models automatically in dev, uncomment the next line
    // await sequelize.sync();
    console.log('✅ Connected to Postgres');
    return true;
  } catch (err) {
    console.warn('⚠️ Could not connect to Postgres:', err.message);
    return false;
  }
}

module.exports = { sequelize, connect, isConnected: () => connected };
