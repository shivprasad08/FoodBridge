const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomUUID } = require('crypto')
const { pool, initializeDatabase } = require('../db/neon')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-me'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

const sanitizeProfile = (row) => ({
  id: row.id,
  role: row.role,
  full_name: row.full_name,
  phone: row.phone,
  address: row.address,
  lat: row.lat,
  lng: row.lng,
  receiving_hours: row.receiving_hours,
  is_verified: row.is_verified,
})

const signToken = (row) =>
  jwt.sign(
    {
      sub: row.id,
      email: row.email,
      role: row.role,
      full_name: row.full_name,
      phone: row.phone,
      address: row.address,
      is_verified: row.is_verified,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

router.post('/signup', async (req, res) => {
  const {
    email,
    password,
    role,
    full_name,
    phone = null,
    address = null,
  } = req.body

  if (!email || !password || !role || !full_name) {
    return res.status(400).json({
      error: true,
      message: 'email, password, role and full_name are required',
    })
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: true,
      message: 'Password must be at least 8 characters',
    })
  }

  if (!['provider', 'recipient', 'admin'].includes(role)) {
    return res.status(400).json({
      error: true,
      message: 'Invalid role',
    })
  }

  try {
    await initializeDatabase()

    const existing = await pool.query(
      'SELECT id FROM app_users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (existing.rowCount > 0) {
      return res.status(409).json({
        error: true,
        message: 'Email is already registered',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const id = randomUUID()

    const result = await pool.query(
      `INSERT INTO app_users (
         id, email, password_hash, full_name, role, phone, address, is_verified
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, full_name, role, phone, address, is_verified`,
      [
        id,
        email.toLowerCase(),
        passwordHash,
        full_name,
        role,
        phone,
        address,
        true,
      ]
    )

    const row = result.rows[0]

    res.status(201).json({
      error: false,
      message: 'Account created successfully',
      data: {
        user: { id: row.id, email: row.email },
        profile: sanitizeProfile(row),
      },
    })
  } catch (err) {
    console.error('[Auth][signup]', err)
    res.status(500).json({
      error: true,
      message: 'Failed to create account',
    })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: 'email and password are required',
    })
  }

  try {
    await initializeDatabase()

    const result = await pool.query(
      `SELECT id, email, password_hash, full_name, role, phone, address, is_verified
       FROM app_users
       WHERE email = $1`,
      [email.toLowerCase()]
    )

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password',
      })
    }

    const row = result.rows[0]
    const valid = await bcrypt.compare(password, row.password_hash)

    if (!valid) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password',
      })
    }

    const token = signToken(row)

    res.json({
      error: false,
      data: {
        access_token: token,
        user: { id: row.id, email: row.email },
        profile: sanitizeProfile(row),
      },
    })
  } catch (err) {
    console.error('[Auth][login]', err)
    res.status(500).json({
      error: true,
      message: 'Login failed',
    })
  }
})

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null

  if (!token) {
    return res.status(401).json({
      error: true,
      message: 'Missing authorization token',
    })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    await initializeDatabase()

    const result = await pool.query(
      `SELECT id, email, full_name, role, phone, address, is_verified
       FROM app_users
       WHERE id = $1`,
      [payload.sub]
    )

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: true,
        message: 'Session is no longer valid',
      })
    }

    const row = result.rows[0]

    res.json({
      error: false,
      data: {
        user: { id: row.id, email: row.email },
        profile: sanitizeProfile(row),
      },
    })
  } catch (err) {
    res.status(401).json({
      error: true,
      message: 'Invalid or expired token',
    })
  }
})

router.patch('/profile', requireAuth, async (req, res) => {
  const { full_name, phone, address, lat, lng, receiving_hours } = req.body || {}

  try {
    await initializeDatabase()

    const result = await pool.query(
      `UPDATE app_users
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           lat = COALESCE($4, lat),
           lng = COALESCE($5, lng),
           receiving_hours = COALESCE($6, receiving_hours),
           updated_at = NOW()
       WHERE id = $7
       RETURNING id, email, full_name, role, phone, address, lat, lng, receiving_hours, is_verified`,
      [
        full_name ?? null,
        phone ?? null,
        address ?? null,
        lat ?? null,
        lng ?? null,
        receiving_hours ?? null,
        req.profile.id,
      ]
    )

    res.json({
      data: {
        user: { id: result.rows[0].id, email: result.rows[0].email },
        profile: sanitizeProfile(result.rows[0]),
      },
      error: false,
      message: 'Profile updated',
    })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

module.exports = router
