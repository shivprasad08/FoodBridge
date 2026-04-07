const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')
const { pool, initializeDatabase } = require('../db/neon')

const router = express.Router()

router.use(requireAuth)
router.use(requireRole('admin'))

const VALID_TASK_STATUSES = ['available', 'claimed', 'picked_up', 'delivered', 'confirmed', 'cancelled']

const mapTaskStatusToListingStatus = (status) => {
  if (status === 'confirmed') return 'completed'
  if (status === 'cancelled') return 'cancelled'
  return status
}

router.get('/stats', async (req, res) => {
  try {
    await initializeDatabase()

    const [providers, ngos, pending, totalListings, activeListings, totalTasks, completedTasks, portions, avgDelivery] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM app_users WHERE role = 'provider'"),
      pool.query("SELECT COUNT(*)::int AS count FROM app_users WHERE role = 'recipient'"),
      pool.query("SELECT COUNT(*)::int AS count FROM app_users WHERE is_verified = false AND role <> 'admin'"),
      pool.query('SELECT COUNT(*)::int AS count FROM food_listings'),
      pool.query("SELECT COUNT(*)::int AS count FROM food_listings WHERE status = 'available'"),
      pool.query('SELECT COUNT(*)::int AS count FROM tasks'),
      pool.query("SELECT COUNT(*)::int AS count FROM tasks WHERE status = 'confirmed'"),
      pool.query(`
        SELECT COALESCE(SUM(fl.quantity_number), 0)::int AS portions
        FROM tasks t
        JOIN food_listings fl ON fl.id = t.food_listing_id
        WHERE t.status = 'confirmed'
      `),
      pool.query(`
        SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (t.confirmed_at - fl.created_at)) / 60), 0)::int AS avg_minutes
        FROM tasks t
        JOIN food_listings fl ON fl.id = t.food_listing_id
        WHERE t.status = 'confirmed' AND t.confirmed_at IS NOT NULL
      `),
    ])

    const totalTasksCount = totalTasks.rows[0].count
    const completedTasksCount = completedTasks.rows[0].count
    const successRate = totalTasksCount > 0 ? Number(((completedTasksCount / totalTasksCount) * 100).toFixed(2)) : 0

    res.json({
      data: {
        total_providers: providers.rows[0].count,
        total_ngos: ngos.rows[0].count,
        pending_verification: pending.rows[0].count,
        total_listings: totalListings.rows[0].count,
        active_listings: activeListings.rows[0].count,
        total_tasks: totalTasksCount,
        completed_tasks: completedTasksCount,
        total_portions: portions.rows[0].portions,
        success_rate: successRate,
        avg_delivery_mins: avgDelivery.rows[0].avg_minutes,
      },
      error: false,
    })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

router.get('/users', async (req, res) => {
  const { role, verified, search, limit = 20, offset = 0 } = req.query

  try {
    await initializeDatabase()

    const params = []
    const filters = []

    if (role && ['provider', 'recipient'].includes(role)) {
      params.push(role)
      filters.push(`u.role = $${params.length}`)
    }

    if (verified === 'true' || verified === 'false') {
      params.push(verified === 'true')
      filters.push(`u.is_verified = $${params.length}`)
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`)
      filters.push(`(LOWER(u.full_name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length})`)
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

    params.push(Number(limit))
    const limitParam = `$${params.length}`
    params.push(Number(offset))
    const offsetParam = `$${params.length}`

    const dataResult = await pool.query(
      `SELECT
         u.id,
         u.email,
         u.full_name,
         u.role,
         u.phone,
         u.address,
         u.lat,
         u.lng,
         u.is_verified,
         u.created_at,
         (
           SELECT COUNT(*)::int
           FROM food_listings fl
           WHERE fl.provider_id = u.id
         ) AS listings_count,
         (
           SELECT COUNT(*)::int
           FROM tasks t
           WHERE t.ngo_id = u.id
         ) AS tasks_count,
         GREATEST(
           COALESCE((SELECT MAX(fl.created_at) FROM food_listings fl WHERE fl.provider_id = u.id), 'epoch'::timestamptz),
           COALESCE((SELECT MAX(t.created_at) FROM tasks t WHERE t.ngo_id = u.id), 'epoch'::timestamptz)
         ) AS last_activity
       FROM app_users u
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ${limitParam}
       OFFSET ${offsetParam}`,
      params
    )

    const countParams = params.slice(0, params.length - 2)
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM app_users u
       ${whereClause}`,
      countParams
    )

    res.json({ data: dataResult.rows, total: countResult.rows[0].count, error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

router.patch('/users/:id/verify', async (req, res) => {
  const { id } = req.params

  try {
    await initializeDatabase()

    const updated = await pool.query(
      `UPDATE app_users
       SET is_verified = true, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, full_name, role, is_verified`,
      [id]
    )

    if (!updated.rowCount) {
      return res.status(404).json({ error: true, message: 'User not found' })
    }

    await pool.query(
      `INSERT INTO notifications (user_id, type, message)
       VALUES ($1, 'account_verified', 'Your FoodBridge account has been verified! You can now start using the platform.')`,
      [id]
    )

    res.json({ data: updated.rows[0], error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

router.patch('/users/:id/suspend', async (req, res) => {
  const { id } = req.params
  const { reason } = req.body || {}

  try {
    await initializeDatabase()

    const updated = await pool.query(
      `UPDATE app_users
       SET is_verified = false, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, full_name, role, is_verified`,
      [id]
    )

    if (!updated.rowCount) {
      return res.status(404).json({ error: true, message: 'User not found' })
    }

    if (reason) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, message)
         VALUES ($1, 'account_suspended', $2)`,
        [id, `Your account has been suspended. Reason: ${reason}`]
      )
    }

    res.json({ data: updated.rows[0], error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

router.get('/listings', async (req, res) => {
  const { status, search, limit = 20, offset = 0 } = req.query

  try {
    await initializeDatabase()

    const params = []
    const filters = []

    if (status) {
      params.push(status)
      filters.push(`fl.status = $${params.length}`)
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`)
      filters.push(`(LOWER(fl.title) LIKE $${params.length} OR LOWER(fl.pickup_address) LIKE $${params.length})`)
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

    params.push(Number(limit))
    const limitParam = `$${params.length}`
    params.push(Number(offset))
    const offsetParam = `$${params.length}`

    const dataResult = await pool.query(
      `SELECT
         fl.*,
         json_build_object(
           'id', provider.id,
           'full_name', provider.full_name,
           'phone', provider.phone,
           'email', provider.email
         ) AS provider,
         (
           SELECT row_to_json(t)
           FROM (
             SELECT id, status, ngo_id, claimed_at, updated_at
             FROM tasks
             WHERE food_listing_id = fl.id
             LIMIT 1
           ) t
         ) AS task,
         (
           SELECT json_build_object('id', ngo.id, 'full_name', ngo.full_name)
           FROM tasks t
           JOIN app_users ngo ON ngo.id = t.ngo_id
           WHERE t.food_listing_id = fl.id
           LIMIT 1
         ) AS ngo
       FROM food_listings fl
       JOIN app_users provider ON provider.id = fl.provider_id
       ${whereClause}
       ORDER BY fl.created_at DESC
       LIMIT ${limitParam}
       OFFSET ${offsetParam}`,
      params
    )

    const countParams = params.slice(0, params.length - 2)
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS count FROM food_listings fl ${whereClause}`,
      countParams
    )

    res.json({ data: dataResult.rows, total: countResult.rows[0].count, error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

router.get('/tasks', async (req, res) => {
  const { status, search, limit = 20, offset = 0 } = req.query

  try {
    await initializeDatabase()

    const params = []
    const filters = []

    if (status) {
      params.push(status)
      filters.push(`t.status = $${params.length}`)
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`)
      filters.push(`LOWER(fl.title) LIKE $${params.length}`)
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

    params.push(Number(limit))
    const limitParam = `$${params.length}`
    params.push(Number(offset))
    const offsetParam = `$${params.length}`

    const dataResult = await pool.query(
      `SELECT
         t.*,
         json_build_object(
           'id', fl.id,
           'title', fl.title,
           'quantity', fl.quantity,
           'pickup_address', fl.pickup_address,
           'pickup_lat', fl.pickup_lat,
           'pickup_lng', fl.pickup_lng,
           'provider_id', fl.provider_id,
           'created_at', fl.created_at
         ) AS food_listing,
         json_build_object(
           'id', p.id,
           'full_name', p.full_name,
           'phone', p.phone,
           'email', p.email
         ) AS provider,
         CASE
           WHEN ngo.id IS NULL THEN NULL
           ELSE json_build_object(
             'id', ngo.id,
             'full_name', ngo.full_name,
             'phone', ngo.phone,
             'email', ngo.email
           )
         END AS ngo,
         COALESCE((
           SELECT json_agg(al ORDER BY al.created_at DESC)
           FROM audit_logs al
           WHERE al.task_id = t.id
         ), '[]'::json) AS audit_logs
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

    const countParams = params.slice(0, params.length - 2)
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM tasks t
       JOIN food_listings fl ON fl.id = t.food_listing_id
       ${whereClause}`,
      countParams
    )

    res.json({ data: dataResult.rows, total: countResult.rows[0].count, error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

router.patch('/tasks/:id/override', async (req, res) => {
  const { id } = req.params
  const { status, note = '' } = req.body || {}

  if (!VALID_TASK_STATUSES.includes(status)) {
    return res.status(400).json({ error: true, message: 'Invalid status value' })
  }

  const client = await pool.connect()
  try {
    await initializeDatabase()
    await client.query('BEGIN')

    const currentRes = await client.query('SELECT * FROM tasks WHERE id = $1 FOR UPDATE', [id])
    if (!currentRes.rowCount) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: true, message: 'Task not found' })
    }

    const current = currentRes.rows[0]

    const taskRes = await client.query(
      `UPDATE tasks
       SET status = $1, updated_at = NOW(),
           claimed_at = CASE WHEN $1 = 'claimed' AND claimed_at IS NULL THEN NOW() ELSE claimed_at END,
           picked_up_at = CASE WHEN $1 = 'picked_up' AND picked_up_at IS NULL THEN NOW() ELSE picked_up_at END,
           delivered_at = CASE WHEN $1 = 'delivered' AND delivered_at IS NULL THEN NOW() ELSE delivered_at END,
           confirmed_at = CASE WHEN $1 = 'confirmed' AND confirmed_at IS NULL THEN NOW() ELSE confirmed_at END,
           completed_at = CASE WHEN $1 = 'confirmed' AND completed_at IS NULL THEN NOW() ELSE completed_at END,
           cancelled_at = CASE WHEN $1 = 'cancelled' THEN NOW() ELSE cancelled_at END
       WHERE id = $2
       RETURNING *`,
      [status, id]
    )

    const nextListingStatus = mapTaskStatusToListingStatus(status)
    await client.query(
      `UPDATE food_listings
       SET status = $1, updated_at = NOW(),
           completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE completed_at END,
           cancelled_at = CASE WHEN $1 = 'cancelled' THEN NOW() ELSE cancelled_at END
       WHERE id = $2`,
      [nextListingStatus, current.food_listing_id]
    )

    await client.query(
      `INSERT INTO audit_logs (task_id, old_status, new_status, changed_by, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, current.status, status, req.profile.id, `Admin override: ${note || 'No reason provided'}`]
    )

    await client.query('COMMIT')

    const fullTask = await pool.query(
      `SELECT
         t.*,
         json_build_object('id', fl.id, 'title', fl.title, 'pickup_address', fl.pickup_address) AS food_listing
       FROM tasks t
       JOIN food_listings fl ON fl.id = t.food_listing_id
       WHERE t.id = $1`,
      [id]
    )

    res.json({ data: fullTask.rows[0], error: false })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: true, message: err.message })
  } finally {
    client.release()
  }
})

router.get('/audit-logs', async (req, res) => {
  const { task_id, search, from, to, limit = 50, offset = 0 } = req.query

  try {
    await initializeDatabase()

    const params = []
    const filters = []

    if (task_id) {
      params.push(task_id)
      filters.push(`al.task_id = $${params.length}`)
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`)
      filters.push(`LOWER(fl.title) LIKE $${params.length}`)
    }

    if (from) {
      params.push(new Date(from).toISOString())
      filters.push(`al.created_at >= $${params.length}`)
    }

    if (to) {
      params.push(new Date(to).toISOString())
      filters.push(`al.created_at <= $${params.length}`)
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

    params.push(Number(limit))
    const limitParam = `$${params.length}`
    params.push(Number(offset))
    const offsetParam = `$${params.length}`

    const dataResult = await pool.query(
      `SELECT
         al.*,
         json_build_object(
           'id', t.id,
           'food_listing_id', t.food_listing_id,
           'title', fl.title
         ) AS task,
         CASE
           WHEN u.id IS NULL THEN NULL
           ELSE json_build_object(
             'id', u.id,
             'full_name', u.full_name,
             'role', u.role
           )
         END AS changed_by_profile
       FROM audit_logs al
       LEFT JOIN tasks t ON t.id = al.task_id
       LEFT JOIN food_listings fl ON fl.id = t.food_listing_id
       LEFT JOIN app_users u ON u.id = al.changed_by
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ${limitParam}
       OFFSET ${offsetParam}`,
      params
    )

    const countParams = params.slice(0, params.length - 2)
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS count FROM audit_logs al ${whereClause}`,
      countParams
    )

    res.json({ data: dataResult.rows, total: countResult.rows[0].count, error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

router.get('/analytics', async (req, res) => {
  try {
    await initializeDatabase()

    const [listingsByDay, tasksByStatus, portionsByDay, topProviders, topNgos] = await Promise.all([
      pool.query(`
        SELECT
          date_trunc('day', created_at)::date AS date,
          COUNT(*)::int AS count
        FROM food_listings
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY 1
      `),
      pool.query(`
        SELECT status, COUNT(*)::int AS count
        FROM tasks
        GROUP BY status
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT
          date_trunc('day', t.confirmed_at)::date AS date,
          COALESCE(SUM(fl.quantity_number), 0)::int AS portions
        FROM tasks t
        JOIN food_listings fl ON fl.id = t.food_listing_id
        WHERE t.status = 'confirmed'
          AND t.confirmed_at >= NOW() - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY 1
      `),
      pool.query(`
        SELECT
          u.full_name AS name,
          COUNT(fl.id)::int AS listings,
          COALESCE(SUM(fl.quantity_number), 0)::int AS portions
        FROM app_users u
        JOIN food_listings fl ON fl.provider_id = u.id
        WHERE u.role = 'provider'
        GROUP BY u.id, u.full_name
        ORDER BY portions DESC
        LIMIT 5
      `),
      pool.query(`
        SELECT
          u.full_name AS name,
          COUNT(t.id)::int AS deliveries,
          COALESCE(SUM(fl.quantity_number), 0)::int AS portions
        FROM app_users u
        JOIN tasks t ON t.ngo_id = u.id
        JOIN food_listings fl ON fl.id = t.food_listing_id
        WHERE u.role = 'recipient' AND t.status = 'confirmed'
        GROUP BY u.id, u.full_name
        ORDER BY portions DESC
        LIMIT 5
      `),
    ])

    res.json({
      data: {
        listings_by_day: listingsByDay.rows,
        tasks_by_status: tasksByStatus.rows,
        portions_by_day: portionsByDay.rows,
        top_providers: topProviders.rows,
        top_ngos: topNgos.rows,
      },
      error: false,
    })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

module.exports = router
