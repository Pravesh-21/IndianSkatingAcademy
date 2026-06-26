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

    // Members table — stores admission details per person
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        dob DATE NOT NULL,
        address TEXT NOT NULL,
        discipline TEXT NOT NULL,
        aadhar_number TEXT,
        guardian_name TEXT,
        blood_group TEXT,
        emergency_contact TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Memberships table — one row per payment/renewal
    await sql`
      CREATE TABLE IF NOT EXISTS memberships (
        id SERIAL PRIMARY KEY,
        member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        plan_months INT NOT NULL,
        amount_paise INT NOT NULL,
        razorpay_order_id TEXT,
        razorpay_payment_id TEXT,
        razorpay_signature TEXT,
        start_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('[Database] All tables ensured (event_registrations, inquiries, members, memberships)');
  } catch (error) {
    console.error('[Database] Error ensuring tables:', error);
  }
}

/**
 * Mark members as suspended if their most-recent membership expired
 * more than 2 months ago. Called on every status check and via cron.
 */
export async function checkAndSuspendExpiredMembers() {
  try {
    // Find members whose latest membership is older than 2 months
    await sql`
      UPDATE members
      SET status = 'suspended', updated_at = NOW()
      WHERE status IN ('active', 'expired')
        AND id IN (
          SELECT DISTINCT member_id
          FROM memberships
          WHERE status = 'active'
            AND expiry_date < NOW() - INTERVAL '2 months'
        )
    `;
    // Also mark ordinary expired (within 2-month grace) — keeps status = 'expired'
    await sql`
      UPDATE members
      SET status = 'expired', updated_at = NOW()
      WHERE status = 'active'
        AND id IN (
          SELECT DISTINCT member_id
          FROM memberships
          WHERE status = 'active'
            AND expiry_date < NOW()
            AND expiry_date >= NOW() - INTERVAL '2 months'
        )
    `;
    // Re-activate members whose active membership hasn't expired yet
    await sql`
      UPDATE members
      SET status = 'active', updated_at = NOW()
      WHERE status IN ('expired')
        AND id IN (
          SELECT DISTINCT member_id
          FROM memberships
          WHERE status = 'active'
            AND expiry_date >= NOW()
        )
    `;
  } catch (error) {
    console.error('[Database] Error in checkAndSuspendExpiredMembers:', error);
  }
}

export default sql;
