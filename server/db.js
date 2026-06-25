const { Pool } = require('pg');
require('dotenv').config();

let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} else {
  console.warn("DATABASE_URL is missing!");
  // Dummy pool that throws on query so the server starts but queries fail gracefully
  pool = {
    query: async () => { throw new Error("Database not configured."); },
    on: () => {}
  };
}

pool.on('connect', () => {
  console.log('Connected to Neon PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
