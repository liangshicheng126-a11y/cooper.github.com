// src/routes/upload.js
const router = require('express').Router()
const fs = require('fs')
const multer = require('multer')
const { auth } = require('../middleware/auth')
const { uploadBuffer } = require('../utils/cosUploadBuffer')
const { v4: uuidv4 } = require('uuid')
const path = require('path')

const DEV_UPLOAD_ROOT = path.join(__dirname, '../../public/uploads')

function detectPublicBase(req) {
  const configured = String(process.env.PUBLIC_BASE_URL || '').trim()
  if (configured) return configured.replace(/\/$/, '')

  const xfProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim()
  const xfHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim()
  const host = xfHost || req.get('host') || ''
  const proto = xfProto || (req.protocol || 'http')
  if (host) return `${proto}://${host}`.replace(/\/$/, '')

  return 'http://127.0.0.1:3000'
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const ext = path.extname(file.originalname).toLowerCase()
    if (!allowed.includes(ext)) return cb(new Error('只允许上传图片文件'))
    cb(null, true)
  },
})

router.post('/image', auth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ code: 400, message: '请选择文件' })
    const ext = path.extname(req.file.originalname).toLowerCase()
    const key = `uploads/${new Date().getFullYear()}/${uuidv4()}${ext}`

    if (process.env.NODE_ENV === 'development') {
      const year = String(new Date().getFullYear())
      const dir = path.join(DEV_UPLOAD_ROOT, year)
      fs.mkdirSync(dir, { recursive: true })
      const filename = `${uuidv4()}${ext}`
      fs.writeFileSync(path.join(dir, filename), req.file.buffer)
      const base = detectPublicBase(req)
      const url = `${base}/uploads/${year}/${filename}`
      return res.json({ code: 0, data: { url } })
    }

    const url = await uploadBuffer(req.file.buffer, key, req.file.mimetype)
    res.json({ code: 0, data: { url } })
  } catch (e) {
    next(e)
  }
})

module.exports = router
