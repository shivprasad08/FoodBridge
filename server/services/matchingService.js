const { pool, initializeDatabase } = require('../db/neon')

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const toRad = (degrees) => degrees * (Math.PI / 180)

const isNGOOpen = (receivingHours) => {
  if (!receivingHours) return true

  const now = new Date()
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const today = days[now.getDay()]
  const hours = receivingHours[today]

  if (!hours || hours === 'closed') return false

  const [openStr, closeStr] = hours.split('-')
  const [openH, openM] = openStr.split(':').map(Number)
  const [closeH, closeM] = closeStr.split(':').map(Number)

  const currentMins = now.getHours() * 60 + now.getMinutes()
  const openMins = openH * 60 + openM
  const closeMins = closeH * 60 + closeM

  return currentMins >= openMins && currentMins < closeMins
}

const findAndNotifyNearbyNGOs = async (listing, radiusKm = 10) => {
  try {
    await initializeDatabase()

    const providerRes = await pool.query(
      `SELECT lat, lng FROM app_users WHERE id = $1 LIMIT 1`,
      [listing.provider_id]
    )

    const providerCoords = providerRes.rows[0] || {}
    const sourceLat = Number(providerCoords.lat ?? listing.pickup_lat)
    const sourceLng = Number(providerCoords.lng ?? listing.pickup_lng)

    if (!Number.isFinite(sourceLat) || !Number.isFinite(sourceLng)) {
      console.log('[Matching] Skipping match: missing provider/listing coordinates')
      return []
    }

    const ngoResult = await pool.query(
      `SELECT id, full_name, phone, lat, lng, receiving_hours
       FROM app_users
       WHERE role = 'recipient'
         AND is_verified = true
         AND lat IS NOT NULL
         AND lng IS NOT NULL`
    )

    const ngos = ngoResult.rows

    if (!ngos || ngos.length === 0) {
      console.log('[Matching] No verified NGOs found')
      return []
    }

    const nearbyNGOs = ngos
      .map((ngo) => ({
        ...ngo,
        distance: haversineDistance(
          sourceLat,
          sourceLng,
          Number(ngo.lat),
          Number(ngo.lng)
        ),
      }))
      .filter((ngo) => ngo.distance <= radiusKm && isNGOOpen(ngo.receiving_hours))

    nearbyNGOs.sort((a, b) => a.distance - b.distance)

    if (nearbyNGOs.length === 0) {
      console.log('[Matching] No NGOs within radius or all closed')
      return []
    }

    const values = []
    const placeholders = []
    nearbyNGOs.forEach((ngo, index) => {
      const base = index * 4
      values.push(
        ngo.id,
        listing.id,
        'new_listing',
        `New food available ${ngo.distance.toFixed(1)}km away - ${listing.title} - ${listing.quantity} at ${listing.pickup_address}`
      )
      placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`)
    })

    await pool.query(
      `INSERT INTO notifications (user_id, listing_id, type, message)
       VALUES ${placeholders.join(', ')}`,
      values
    )

    return nearbyNGOs
  } catch (err) {
    console.error('[Matching] Unexpected error:', err.message)
    return []
  }
}

module.exports = {
  findAndNotifyNearbyNGOs,
  haversineDistance,
  isNGOOpen,
}
