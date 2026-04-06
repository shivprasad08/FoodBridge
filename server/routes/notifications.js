const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { pool, initializeDatabase } = require('../db/neon')

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    await initializeDatabase()
    const limit = Math.min(Number(req.query.limit || 30), 100)

    const result = await pool.query(
      `SELECT
         n.*,
         CASE
           WHEN fl.id IS NULL THEN NULL
           ELSE json_build_object(
             'id', fl.id,
             'title', fl.title,
             'food_type', fl.food_type,
             'quantity', fl.quantity,
             'pickup_address', fl.pickup_address,
             'pickup_lat', fl.pickup_lat,
             'pickup_lng', fl.pickup_lng,
             'expiry_time', fl.expiry_time,
             'status', fl.status,
             'photo_url', fl.photo_url
           )
         END AS listing
       FROM notifications n
       LEFT JOIN food_listings fl ON fl.id = n.listing_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2`,
      [req.profile.id, limit]
    )

    res.json({ data: result.rows, error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    await initializeDatabase()

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.profile.id]
    )

    if (!result.rowCount) {
      return res.status(404).json({ error: true, message: 'Notification not found' })
    }

    res.json({ error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    await initializeDatabase()

    await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE user_id = $1 AND is_read = false`,
      [req.profile.id]
    )

    res.json({ error: false })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

module.exports = router
