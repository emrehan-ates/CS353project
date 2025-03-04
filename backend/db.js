// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'vehicle_marketplace',
  password: 'piyanist05',
  port: 5432,
});

module.exports = { pool };
