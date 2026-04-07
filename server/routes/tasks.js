const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')
const { pool, initializeDatabase } = require('../db/neon')

const router = express.Router()

const insertAuditLog = async ({ taskId, oldStatus, newStatus, changedBy, note = null, client = pool }) => {
  await client.query(
    `INSERT INTO audit_logs (task_id, old_status, new_status, changed_by, note)
     VALUES ($1, $2, $3, $4, $5)`,
    [taskId, oldStatus, newStatus, changedBy, note]
  )
}

const fetchTaskWithJoins = async (taskId) => {
  const result = await pool.query(
    `SELECT
       t.*,
       json_build_object(
         'id', fl.id,
         'title', fl.title,
         'food_type', fl.food_type,
         'quantity', fl.quantity,
         'quantity_number', fl.quantity_number,
         'pickup_address', fl.pickup_address,
         'pickup_lat', fl.pickup_lat,
         'pickup_lng', fl.pickup_lng,
         'expiry_time', fl.expiry_time,
         'photo_url', fl.photo_url,
         'status', fl.status,
         'provider_id', fl.provider_id
       ) AS food_listing,
       json_build_object(
         'id', p.id,
         'full_name', p.full_name,
         'phone', p.phone,
         'address', p.address
       ) AS provider,
       CASE
         WHEN ngo.id IS NULL THEN NULL
         ELSE json_build_object(
           'id', ngo.id,
           'full_name', ngo.full_name,
           'phone', ngo.phone,
           'address', ngo.address
         )
       END AS ngo
     FROM tasks t
     JOIN food_listings fl ON fl.id = t.food_listing_id
     JOIN app_users p ON p.id = fl.provider_id
     LEFT JOIN app_users ngo ON ngo.id = t.ngo_id
     WHERE t.id = $1`,
    [taskId]
  )

  return result.rowCount ? result.rows[0] : null
}

// GET /api/tasks
router.get('/', requireAuth, async (req, res) => {
  const { profile } = req
  const { status, limit = 20, offset = 0 } = req.query

  if (!['provider', 'recipient', 'admin'].includes(profile.role)) {
    return res.status(403).json({
      error: true,
      message: 'Access denied. Required role: provider, recipient or admin',
    })
  }

  try {
    await initializeDatabase()

    const params = []
    const filters = []

    if (profile.role === 'recipient') {
      params.push(profile.id)
      filters.push(`t.ngo_id = $${params.length}`)
    } else if (profile.role === 'provider') {
      params.push(profile.id)
      filters.push(`fl.provider_id = $${params.length}`)
    }

    if (status) {
      params.push(status)
      filters.push(`t.status = $${params.length}`)
    }

    params.push(Number(limit))
    const limitParam = `$${params.length}`
    params.push(Number(offset))
    const offsetParam = `$${params.length}`

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

    const result = await pool.query(
      `SELECT
         t.*,
         json_build_object(
           'id', fl.id,
           'title', fl.title,
           'food_type', fl.food_type,
           'quantity', fl.quantity,
           'quantity_number', fl.quantity_number,
           'pickup_address', fl.pickup_address,
           'pickup_lat', fl.pickup_lat,
           'pickup_lng', fl.pickup_lng,
           'expiry_time', fl.expiry_time,
           'photo_url', fl.photo_url,
           'status', fl.status,
           'provider_id', fl.provider_id
         ) AS food_listing,
         json_build_object(
           'id', p.id,
           'full_name', p.full_name,
           'phone', p.phone,
           'address', p.address
         ) AS provider,
         CASE
           WHEN ngo.id IS NULL THEN NULL
           ELSE json_build_object(
             'id', ngo.id,
             'full_name', ngo.full_name,
             'phone', ngo.phone,
             'address', ngo.address
           )
         END AS ngo
       FROM tasks t
       JOIN food_listings fl ON fl.id = t.food_listing_id
       JOIN app_users p ON p.id = fl.provider_id
       LEFT JOIN app_users ngo ON ngo.id = t.ngo_id
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT ${limitParam}
       OFFSET ${offsetParam}`,
      params
    )

    res.json({ data: result.rows, error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

// PATCH /api/tasks/:id/claim
router.patch('/:id/claim', requireAuth, requireRole('recipient'), async (req, res) => {
  const { id } = req.params
  const { profile } = req
  const { assigned_to = null } = req.body || {}

  const client = await pool.connect()
  try {
    await initializeDatabase()
    await client.query('BEGIN')

    const current = await client.query('SELECT * FROM tasks WHERE id = $1 FOR UPDATE', [id])
    if (current.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: true, message: 'Task not found' })
    }

    if (current.rows[0].status !== 'available') {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: true, message: 'Already claimed' })
    }

    const updatedTaskRes = await client.query(
      `UPDATE tasks
       SET status = 'claimed', ngo_id = $1, claimed_at = NOW(), assigned_to = COALESCE($2, assigned_to), updated_at = NOW()
       WHERE id = $3 AND status = 'available'
       RETURNING *`,
      [profile.id, assigned_to, id]
    )

    if (updatedTaskRes.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: true, message: 'Already claimed' })
    }

    const updatedTask = updatedTaskRes.rows[0]

    const listingRes = await client.query(
      `UPDATE food_listings
       SET status = 'claimed', updated_at = NOW()
       WHERE id = $1
       RETURNING id, title, provider_id`,
      [updatedTask.food_listing_id]
    )

    const listing = listingRes.rows[0]

    await client.query(
      `INSERT INTO notifications (user_id, listing_id, type, message)
       VALUES ($1, $2, 'listing_claimed', $3)`,
      [
        listing.provider_id,
        listing.id,
        `Your listing "${listing.title}" has been claimed by ${profile.full_name}`,
      ]
    )

    await insertAuditLog({
      taskId: updatedTask.id,
      oldStatus: 'available',
      newStatus: 'claimed',
      changedBy: profile.id,
      note: 'Task claimed by NGO',
      client,
    })

    await client.query('COMMIT')

    const task = await fetchTaskWithJoins(id)
    res.json({ data: task, error: false, message: 'Claimed!' })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: true, message: err.message })
  } finally {
    client.release()
  }
})

// PATCH /api/tasks/:id/pickup
router.patch('/:id/pickup', requireAuth, requireRole('recipient'), async (req, res) => {
  const { id } = req.params
  const { profile } = req
  const { pickup_photo_url = null } = req.body || {}

  try {
    await initializeDatabase()
    const currentRes = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
    if (currentRes.rowCount === 0) {
      return res.status(404).json({ error: true, message: 'Task not found' })
    }

    const current = currentRes.rows[0]
    if (current.ngo_id !== profile.id) {
      return res.status(403).json({ error: true, message: 'Not your task' })
    }
    if (current.status !== 'claimed') {
      return res.status(409).json({ error: true, message: 'Task must be in claimed status' })
    }

    const updatedRes = await pool.query(
      `UPDATE tasks
       SET status = 'picked_up',
           picked_up_at = NOW(),
           pickup_photo_url = COALESCE($1, pickup_photo_url),
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [pickup_photo_url, id]
    )

    await pool.query(
      `UPDATE food_listings SET status = 'picked_up', updated_at = NOW() WHERE id = $1`,
      [current.food_listing_id]
    )

    const listingRes = await pool.query(
      'SELECT id, title, provider_id FROM food_listings WHERE id = $1',
      [current.food_listing_id]
    )

    if (listingRes.rowCount) {
      const listing = listingRes.rows[0]
      await pool.query(
        `INSERT INTO notifications (user_id, listing_id, type, message)
         VALUES ($1, $2, 'picked_up', $3)`,
        [
          listing.provider_id,
          listing.id,
          `Your food "${listing.title}" has been picked up and is on its way`,
        ]
      )
    }

    await insertAuditLog({
      taskId: id,
      oldStatus: 'claimed',
      newStatus: 'picked_up',
      changedBy: profile.id,
      note: 'Marked as picked up',
    })

    const task = await fetchTaskWithJoins(updatedRes.rows[0].id)
    res.json({ data: task, error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

// PATCH /api/tasks/:id/deliver
router.patch('/:id/deliver', requireAuth, requireRole('recipient'), async (req, res) => {
  const { id } = req.params
  const { profile } = req

  try {
    await initializeDatabase()
    const currentRes = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
    if (currentRes.rowCount === 0) {
      return res.status(404).json({ error: true, message: 'Task not found' })
    }

    const current = currentRes.rows[0]
    if (current.ngo_id !== profile.id) {
      return res.status(403).json({ error: true, message: 'Not your task' })
    }
    if (current.status !== 'picked_up') {
      return res.status(409).json({ error: true, message: 'Task must be in picked_up status' })
    }

    await pool.query(
      `UPDATE tasks
       SET status = 'delivered', delivered_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [id]
    )

    await pool.query(
      `UPDATE food_listings SET status = 'picked_up', updated_at = NOW() WHERE id = $1`,
      [current.food_listing_id]
    )

    const listingRes = await pool.query(
      'SELECT id, title, provider_id FROM food_listings WHERE id = $1',
      [current.food_listing_id]
    )

    if (listingRes.rowCount) {
      const listing = listingRes.rows[0]
      await pool.query(
        `INSERT INTO notifications (user_id, listing_id, type, message)
         VALUES ($1, $2, 'delivered', $3)`,
        [
          listing.provider_id,
          listing.id,
          `Your food "${listing.title}" has been delivered to ${profile.full_name}`,
        ]
      )
    }

    await insertAuditLog({
      taskId: id,
      oldStatus: 'picked_up',
      newStatus: 'delivered',
      changedBy: profile.id,
      note: 'Marked as delivered',
    })

    const task = await fetchTaskWithJoins(id)
    res.json({ data: task, error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

// PATCH /api/tasks/:id/confirm
router.patch('/:id/confirm', requireAuth, requireRole('recipient'), async (req, res) => {
  const { id } = req.params
  const { profile } = req
  const { receipt_photo_url = null, assigned_to = null } = req.body || {}

  try {
    await initializeDatabase()
    const currentRes = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
    if (currentRes.rowCount === 0) {
      return res.status(404).json({ error: true, message: 'Task not found' })
    }

    const current = currentRes.rows[0]
    if (current.ngo_id !== profile.id) {
      return res.status(403).json({ error: true, message: 'Not your task' })
    }
    if (current.status !== 'delivered') {
      return res.status(409).json({ error: true, message: 'Task must be in delivered status' })
    }

    await pool.query(
      `UPDATE tasks
       SET status = 'confirmed',
           confirmed_at = NOW(),
           completed_at = NOW(),
           receipt_photo_url = COALESCE($1, receipt_photo_url),
           assigned_to = COALESCE($2, assigned_to),
           updated_at = NOW()
       WHERE id = $3`,
      [receipt_photo_url, assigned_to, id]
    )

    const listingRes = await pool.query(
      `UPDATE food_listings
       SET status = 'completed', completed_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING id, title, provider_id, quantity_number`,
      [current.food_listing_id]
    )

    if (listingRes.rowCount) {
      const listing = listingRes.rows[0]
      await pool.query(
        `INSERT INTO notifications (user_id, listing_id, type, message)
         VALUES ($1, $2, 'confirmed', $3)`,
        [
          listing.provider_id,
          listing.id,
          `Your food "${listing.title}" was successfully received by ${profile.full_name}. ${listing.quantity_number} portions delivered!`,
        ]
      )
    }

    await insertAuditLog({
      taskId: id,
      oldStatus: 'delivered',
      newStatus: 'confirmed',
      changedBy: profile.id,
      note: 'Receipt confirmed',
    })

    const task = await fetchTaskWithJoins(id)
    res.json({ data: task, error: false, message: 'Confirmed!' })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

// GET /api/tasks/stats
router.get('/stats', requireAuth, requireRole('recipient'), async (req, res) => {
  const { profile } = req

  try {
    await initializeDatabase()

    const totalClaimedRes = await pool.query(
      'SELECT COUNT(*)::int AS count FROM tasks WHERE ngo_id = $1',
      [profile.id]
    )

    const totalConfirmedRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM tasks WHERE ngo_id = $1 AND status = 'confirmed'",
      [profile.id]
    )

    const totalActiveRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM tasks WHERE ngo_id = $1 AND status IN ('claimed','picked_up','delivered')",
      [profile.id]
    )

    const portionsRes = await pool.query(
      `SELECT COALESCE(SUM(fl.quantity_number), 0)::int AS portions
       FROM tasks t
       JOIN food_listings fl ON fl.id = t.food_listing_id
       WHERE t.ngo_id = $1 AND t.status = 'confirmed'`,
      [profile.id]
    )

    res.json({
      data: {
        total_claimed: totalClaimedRes.rows[0].count,
        total_confirmed: totalConfirmedRes.rows[0].count,
        total_active: totalActiveRes.rows[0].count,
        total_portions: portionsRes.rows[0].portions,
      },
      error: false,
    })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

router.get('/:id([0-9a-fA-F-]{36})', requireAuth, async (req, res) => {
  try {
    await initializeDatabase()
    const task = await fetchTaskWithJoins(req.params.id)
    if (!task) {
      return res.status(404).json({ error: true, message: 'Task not found' })
    }

    if (req.profile.role === 'recipient' && task.ngo?.id !== req.profile.id) {
      return res.status(403).json({ error: true, message: 'Not your task' })
    }

    res.json({ data: task, error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

module.exports = router
