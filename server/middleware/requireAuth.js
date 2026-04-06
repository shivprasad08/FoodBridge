const jwt = require('jsonwebtoken')
const { pool, initializeDatabase } = require('../db/neon')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-me'

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: true,
      message: 'Missing authorization header'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    await initializeDatabase()

    const result = await pool.query(
      `SELECT id, email, role, full_name, phone, address, is_verified, lat, lng, receiving_hours
       FROM app_users
       WHERE id = $1`,
      [payload.sub]
    )

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: true,
        message: 'Invalid or expired token'
      })
    }

    const profile = result.rows[0]

    req.user = {
      id: profile.id,
      email: profile.email,
    }
    req.profile = profile
    next()
  } catch (err) {
    return res.status(401).json({
      error: true,
      message: 'Invalid or expired token'
    })
  }
}

module.exports = requireAuth
