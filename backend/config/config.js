require('dotenv').config();

const common = {
  dialect: 'postgres',
};

module.exports = {
  development: {
    url: process.env.DATABASE_URL || undefined,
    username: process.env.DB_USER || process.env.PGUSER || undefined,
    password: process.env.DB_PASS || process.env.PGPASSWORD || undefined,
    database: process.env.DB_NAME || process.env.PGDATABASE || undefined,
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    dialect: common.dialect,
  },
  test: {
    url: process.env.DATABASE_URL || undefined,
    username: process.env.DB_USER || process.env.PGUSER || undefined,
    password: process.env.DB_PASS || process.env.PGPASSWORD || undefined,
    database: process.env.DB_NAME || process.env.PGDATABASE || 'test_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    dialect: common.dialect,
  },
  production: {
    url: process.env.DATABASE_URL || undefined,
    username: process.env.DB_USER || process.env.PGUSER || undefined,
    password: process.env.DB_PASS || process.env.PGPASSWORD || undefined,
    database: process.env.DB_NAME || process.env.PGDATABASE || undefined,
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    dialect: common.dialect,
  },
};
