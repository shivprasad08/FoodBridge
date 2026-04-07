const { Pool } = require('pg')

const connectionString =
  process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || ''

if (!connectionString) {
  console.warn(
    '[DB] NEON_DATABASE_URL or DATABASE_URL is not set. Auth endpoints will fail until configured.'
  )
}

const pool = new Pool({
  connectionString,
  ssl: connectionString ? { rejectUnauthorized: false } : undefined,
})

let initialized = false

const initializeDatabase = async () => {
  if (initialized) return

  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('provider', 'recipient', 'admin')),
      phone TEXT,
      address TEXT,
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      receiving_hours JSONB,
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS food_listings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      food_type TEXT NOT NULL,
      quantity TEXT NOT NULL,
      quantity_number INTEGER NOT NULL,
      pickup_address TEXT NOT NULL,
      pickup_lat DOUBLE PRECISION NOT NULL,
      pickup_lng DOUBLE PRECISION NOT NULL,
      expiry_time TIMESTAMPTZ NOT NULL,
      notes TEXT,
      photo_url TEXT,
      status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'picked_up', 'completed', 'cancelled')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      cancelled_at TIMESTAMPTZ
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      food_listing_id UUID NOT NULL UNIQUE REFERENCES food_listings(id) ON DELETE CASCADE,
      ngo_id UUID REFERENCES app_users(id),
      status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'picked_up', 'delivered', 'confirmed', 'completed', 'cancelled')),
      claimed_at TIMESTAMPTZ,
      picked_up_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ,
      confirmed_at TIMESTAMPTZ,
      pickup_photo_url TEXT,
      receipt_photo_url TEXT,
      assigned_to TEXT,
      completed_at TIMESTAMPTZ,
      cancelled_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query("ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check")
  await pool.query("ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('available', 'claimed', 'picked_up', 'delivered', 'confirmed', 'completed', 'cancelled'))")
  await pool.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ')
  await pool.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ')
  await pool.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pickup_photo_url TEXT')
  await pool.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS receipt_photo_url TEXT')
  await pool.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to TEXT')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      listing_id UUID REFERENCES food_listings(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
      old_status TEXT,
      new_status TEXT,
      changed_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query('CREATE INDEX IF NOT EXISTS idx_food_listings_provider_id ON food_listings(provider_id)')
  await pool.query('CREATE INDEX IF NOT EXISTS idx_food_listings_status ON food_listings(status)')
  await pool.query('CREATE INDEX IF NOT EXISTS idx_tasks_food_listing_id ON tasks(food_listing_id)')
  await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)')
  await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_task_id ON audit_logs(task_id)')
  await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC)')

  initialized = true
}

module.exports = {
  pool,
  initializeDatabase,
}
