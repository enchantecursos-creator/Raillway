require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conexão com PostgreSQL OK! Data/hora do servidor:', res.rows[0].now);
  } catch (err) {
    console.error('Erro na conexão com PostgreSQL:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
