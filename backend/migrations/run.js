const { Client } = require('pg');
require('dotenv').config();

const migrations = [
  {
    name: '001_create_users_table',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(100),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `,
    down: 'DROP TABLE IF EXISTS users CASCADE;'
  },
  {
    name: '002_create_puzzles_table',
    up: `
      CREATE TABLE IF NOT EXISTS puzzles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        difficulty VARCHAR(20),
        theme VARCHAR(50),
        json_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_puzzles_difficulty ON puzzles(difficulty);
      CREATE INDEX IF NOT EXISTS idx_puzzles_theme ON puzzles(theme);
    `,
    down: 'DROP TABLE IF EXISTS puzzles CASCADE;'
  },
  {
    name: '003_create_user_progress_table',
    up: `
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        puzzle_id INTEGER REFERENCES puzzles(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        completion_time INTEGER,
        attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, puzzle_id)
      );
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_progress_puzzle_id ON user_progress(puzzle_id);
    `,
    down: 'DROP TABLE IF EXISTS user_progress CASCADE;'
  },
  {
    name: '004_create_user_queue_table',
    up: `
      CREATE TABLE IF NOT EXISTS user_queue (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        puzzle_order INTEGER[] NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `,
    down: 'DROP TABLE IF NOT EXISTS user_queue CASCADE;'
  }
];

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Run each migration
    for (const migration of migrations) {
      const result = await client.query(
        'SELECT * FROM migrations WHERE name = $1',
        [migration.name]
      );

      if (result.rows.length === 0) {
        console.log(`Running migration: ${migration.name}`);
        await client.query(migration.up);
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration.name]
        );
        console.log(`✅ Completed: ${migration.name}`);
      } else {
        console.log(`⏭️  Skipping: ${migration.name} (already applied)`);
      }
    }

    console.log('🎉 All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runMigrations, migrations };
