const cron = require('node-cron')
const { pool } = require('../db/neon')

const expireListings = async () => {
  try {
    console.log('[Cron] Running expire-listings job...')

    const now = new Date().toISOString()

    // Step 1: Find all expired available listings
    const listingsResult = await pool.query(`
      SELECT 
        fl.id,
        fl.title,
        fl.provider_id,
        fl.quantity_number,
        json_agg(json_build_object('id', t.id, 'status', t.status)) as tasks
      FROM food_listings fl
      LEFT JOIN tasks t ON t.listing_id = fl.id
      WHERE fl.status = 'available'
        AND fl.expiry_time < $1
      GROUP BY fl.id, fl.title, fl.provider_id, fl.quantity_number
    `, [now])

    const expiredListings = listingsResult.rows

    if (expiredListings.length === 0) {
      console.log('[Cron] No expired listings.')
      return
    }

    console.log(`[Cron] Found ${expiredListings.length} expired listings`)

    const listingIds = expiredListings.map(l => l.id)

    // Step 2: Update listings to 'expired'
    await pool.query(
      `UPDATE food_listings SET status = $1 WHERE id = ANY($2) AND status = 'available'`,
      ['expired', listingIds]
    )

    // Step 3: Update associated tasks to 'expired'
    const taskIds = expiredListings
      .flatMap(l => l.tasks || [])
      .filter(t => t.status === 'available')
      .map(t => t.id)

    if (taskIds.length > 0) {
      await pool.query(
        `UPDATE tasks SET status = $1 WHERE id = ANY($2)`,
        ['expired', taskIds]
      )
    }

    // Step 4: Insert notifications for each provider
    const notifications = expiredListings.map(listing => [
      listing.provider_id,
      listing.id,
      'listing_expired',
      `Your listing "${listing.title}" expired without being claimed. Consider reposting with a later expiry time.`,
      false
    ])

    if (notifications.length > 0) {
      await pool.query(`
        INSERT INTO notifications (user_id, listing_id, type, message, is_read)
        VALUES ${notifications.map((_, idx) => `($${idx * 5 + 1}, $${idx * 5 + 2}, $${idx * 5 + 3}, $${idx * 5 + 4}, $${idx * 5 + 5})`).join(',')}
      `, notifications.flat())
    }

    console.log(
      `[Cron] Successfully expired ${expiredListings.length} listings`
    )

  } catch (err) {
    console.error('[Cron] Error in expire-listings job:', err)
  }
}

// Schedule: runs every 15 minutes
const startExpiryJob = () => {
  cron.schedule('*/15 * * * *', expireListings)
  console.log('[Cron] Expiry job scheduled every 15 minutes.')

  // Also run immediately on server start
  expireListings()
}

module.exports = { startExpiryJob, expireListings }
