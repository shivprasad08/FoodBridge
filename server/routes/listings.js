const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')
const { pool, initializeDatabase } = require('../db/neon')
const { findAndNotifyNearbyNGOs } = require('../services/matchingService')

const router = express.Router()

// GET /api/listings
router.get('/', requireAuth, async (req, res) => {
  const { profile } = req
  const { status, limit = 20, offset = 0 } = req.query

  const params = []
  const filters = []

  if (profile.role === 'provider') {
    params.push(profile.id)
    filters.push(`fl.provider_id = $${params.length}`)
  } else if (profile.role === 'recipient') {
    filters.push(`fl.status = 'available'`)
  }

  if (status) {
    params.push(status)
    filters.push(`fl.status = $${params.length}`)
  }

  params.push(Number(limit))
  const limitParam = `$${params.length}`
  params.push(Number(offset))
  const offsetParam = `$${params.length}`

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

  try {
    await initializeDatabase()

    const result = await pool.query(
      `SELECT
         fl.*,
         json_build_object(
           'full_name', provider.full_name,
           'phone', provider.phone,
           'address', provider.address
         ) AS provider,
         (
           SELECT row_to_json(t)
           FROM tasks t
           WHERE t.food_listing_id = fl.id
         ) AS task
       FROM food_listings fl
       JOIN app_users provider ON provider.id = fl.provider_id
       ${whereClause}
       ORDER BY fl.created_at DESC
       LIMIT ${limitParam}
       OFFSET ${offsetParam}`,
      params
    )

    res.json({ data: result.rows, error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

// POST /api/listings
router.post('/', requireAuth, requireRole('provider'), async (req, res) => {
  const {
    title,
    food_type,
    quantity,
    quantity_number,
    pickup_address,
    pickup_lat,
    pickup_lng,
    expiry_time,
    notes,
    photo_url,
  } = req.body
  const { profile } = req

  if (
    !title ||
    !food_type ||
    !quantity ||
    !quantity_number ||
    !pickup_address ||
    pickup_lat === undefined ||
    pickup_lng === undefined ||
    !expiry_time
  ) {
    return res.status(400).json({ error: true, message: 'Missing required fields' })
  }

  const expiry = new Date(expiry_time)
  if (expiry < new Date(Date.now() + 30 * 60 * 1000)) {
    return res
      .status(400)
      .json({ error: true, message: 'Expiry must be at least 30 minutes from now' })
  }

  try {
    await initializeDatabase()

    const created = await pool.query(
      `INSERT INTO food_listings (
         provider_id, title, food_type, quantity, quantity_number,
         pickup_address, pickup_lat, pickup_lng, expiry_time, notes, photo_url
       ) VALUES (
         $1, $2, $3, $4, $5,
         $6, $7, $8, $9, $10, $11
       )
       RETURNING *`,
      [
        profile.id,
        title,
        food_type,
        quantity,
        Number(quantity_number),
        pickup_address,
        Number(pickup_lat),
        Number(pickup_lng),
        expiry.toISOString(),
        notes || null,
        photo_url || null,
      ]
    )

    const newListing = created.rows[0]

    await pool.query(
      `INSERT INTO tasks (food_listing_id, status)
       VALUES ($1, 'available')
       ON CONFLICT (food_listing_id) DO NOTHING`,
      [newListing.id]
    )

    const taskRes = await pool.query(
      `SELECT id FROM tasks WHERE food_listing_id = $1 LIMIT 1`,
      [newListing.id]
    )

    if (taskRes.rowCount) {
      await pool.query(
        `INSERT INTO audit_logs (task_id, old_status, new_status, changed_by, note)
         VALUES ($1, $2, $3, $4, $5)`,
        [taskRes.rows[0].id, null, 'available', profile.id, 'Listing posted']
      )
    }

    let matchedNGOs = []
    try {
      matchedNGOs = await findAndNotifyNearbyNGOs(newListing)
    } catch (err) {
      console.error('[Listings] Matching error:', err.message)
    }

    res.status(201).json({
      data: newListing,
      error: false,
      message: `Listing created. Notified ${matchedNGOs.length} nearby NGOs.`,
    })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

// GET /api/listings/:id
router.get('/:id([0-9a-fA-F-]{36})', requireAuth, async (req, res) => {
  const { id } = req.params

  try {
    await initializeDatabase()

    const result = await pool.query(
      `SELECT
         fl.*,
         json_build_object(
           'full_name', provider.full_name,
           'phone', provider.phone
         ) AS provider,
         (
           SELECT row_to_json(t)
           FROM tasks t
           WHERE t.food_listing_id = fl.id
         ) AS task,
         (
           SELECT json_build_object(
             'full_name', ngo.full_name,
             'phone', ngo.phone
           )
           FROM tasks t
           JOIN app_users ngo ON ngo.id = t.ngo_id
           WHERE t.food_listing_id = fl.id
         ) AS ngo
       FROM food_listings fl
       JOIN app_users provider ON provider.id = fl.provider_id
       WHERE fl.id = $1`,
      [id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: true, message: 'Listing not found' })
    }

    res.json({ data: result.rows[0], error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

// PATCH /api/listings/:id/cancel
router.patch('/:id/cancel', requireAuth, requireRole('provider'), async (req, res) => {
  const { id } = req.params
  const { profile } = req

  try {
    await initializeDatabase()

    const listingRes = await pool.query(
      'SELECT * FROM food_listings WHERE id = $1',
      [id]
    )

    if (listingRes.rowCount === 0) {
      return res.status(404).json({ error: true, message: 'Listing not found' })
    }

    const listing = listingRes.rows[0]
    if (listing.provider_id !== profile.id) {
      return res.status(403).json({ error: true, message: 'Not your listing' })
    }

    const taskRes = await pool.query(
      'SELECT * FROM tasks WHERE food_listing_id = $1',
      [id]
    )

    if (taskRes.rowCount > 0 && taskRes.rows[0].status !== 'available') {
      return res.status(409).json({
        error: true,
        message: 'Cannot cancel - listing has already been claimed',
      })
    }

    const updatedListingRes = await pool.query(
      `UPDATE food_listings
       SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    await pool.query(
      `UPDATE tasks
       SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
       WHERE food_listing_id = $1`,
      [id]
    )

    if (taskRes.rowCount > 0) {
      await pool.query(
        `INSERT INTO audit_logs (task_id, old_status, new_status, changed_by, note)
         VALUES ($1, $2, $3, $4, $5)`,
        [taskRes.rows[0].id, taskRes.rows[0].status, 'cancelled', profile.id, 'Cancelled by provider']
      )
    }

    res.json({
      data: updatedListingRes.rows[0],
      error: false,
      message: 'Listing cancelled',
    })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

// GET /api/listings/stats
router.get('/stats', requireAuth, requireRole('provider'), async (req, res) => {
  const { profile } = req

  try {
    await initializeDatabase()

    const result = await pool.query(
      'SELECT * FROM food_listings WHERE provider_id = $1',
      [profile.id]
    )

    const data = result.rows
    const total_posted = data.length
    const total_completed = data.filter((l) => l.status === 'completed').length
    const total_cancelled = data.filter((l) => l.status === 'cancelled').length
    const total_active = data.filter((l) =>
      ['available', 'claimed', 'picked_up'].includes(l.status)
    ).length
    const total_portions = data
      .filter((l) => l.status === 'completed')
      .reduce((sum, l) => sum + (l.quantity_number || 0), 0)

    res.json({
      data: {
        total_posted,
        total_completed,
        total_cancelled,
        total_active,
        total_portions,
      },
      error: false,
    })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

module.exports = router
