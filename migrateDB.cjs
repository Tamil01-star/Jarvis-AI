const { pool } = require('./server/db');

async function migrate() {
  try {
    console.log('Migrating users table for Firebase Auth...');
    
    // Add new columns if they don't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);
    
    // Make nickname optional since Google login might not have one initially
    await pool.query(`
      ALTER TABLE users ALTER COLUMN nickname DROP NOT NULL;
    `);

    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}

migrate();
