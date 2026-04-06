const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const extension = file.mimetype.split('/')[1] || 'jpg'
    cb(null, `${req.profile.id}-${Date.now()}.${extension}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only jpg, png, webp allowed'))
    }
  },
})

// POST /api/uploads/food-photo
router.post('/food-photo', requireAuth, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: true,
      message: 'No file uploaded',
    })
  }

  const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  res.json({ data: { url: publicUrl }, error: false })
})

module.exports = router
