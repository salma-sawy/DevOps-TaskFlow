const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool(config.pg);

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error on idle client', err);
});

async function query(text, params) {
  return pool.query(text, params);
}

async function checkConnection() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = { query, checkConnection, pool };