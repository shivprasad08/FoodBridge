const express = require('express')
const cors    = require('cors')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '.env') })

const authRouter     = require('./routes/auth')
const listingsRouter = require('./routes/listings')
const tasksRouter    = require('./routes/tasks')
const notificationsRouter = require('./routes/notifications')
const uploadsRouter  = require('./routes/uploads')
const adminRouter = require('./routes/admin')
const { initializeDatabase } = require('./db/neon')
const { startExpiryJob } = require('./jobs/expireListings')

const app  = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = (process.env.CORS_ORIGINS ||
  'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

const vercelOriginPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true)
      return
    }

    if (allowedOrigins.includes(origin) || vercelOriginPattern.test(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/listings', listingsRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/uploads', uploadsRouter)
app.use('/api/admin', adminRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: true,
    message: err.message || 'Internal server error'
  })
})

const startServer = async () => {
  try {
    await initializeDatabase()
    console.log('[DB] Neon schema is ready')
  } catch (err) {
    console.error('[DB] Schema initialization failed:', err.message)
  }

  // Start background jobs
  startExpiryJob()

  app.listen(PORT, () => {
    console.log(`FoodBridge server running on port ${PORT}`)
  })
}

startServer()
