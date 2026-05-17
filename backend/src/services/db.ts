import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL || DATABASE_URL === 'postgres://your_neon_connection_string_here') {
  console.warn('[Database] Warning: DATABASE_URL is not properly set in .env');
}

let sql: any;
try {
  sql = neon(DATABASE_URL);
} catch (error) {
  console.warn('[Database] Failed to initialize Neon client (invalid URL). Queries will fail.');
  sql = async () => {
    throw new Error('Database connection string is invalid or missing. Please check your .env file.');
  };
}

export async function initializeDatabase() {
  if (!DATABASE_URL || DATABASE_URL === 'postgres://your_neon_connection_string_here') {
    console.error('[Database] Cannot initialize database: DATABASE_URL is missing or placeholder');
    return;
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        age INT NOT NULL,
        phone TEXT NOT NULL,
        discipline TEXT NOT NULL,
        method TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('[Database] Tables "event_registrations" and "inquiries" ensured');
  } catch (error) {
    console.error('[Database] Error ensuring table:', error);
  }
}

export default sql;
