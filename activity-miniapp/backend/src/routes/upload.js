// src/routes/upload.js
const router = require('express').Router()
const multer = require('multer')
const { auth } = require('../middleware/auth')
const { uploadBuffer } = require('../utils/cosUploadBuffer')
const { v4: uuidv4 } = require('uuid')
const path = require('path')

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
      return res.json({ code: 0, data: { url: `https://placeholder.com/750x420.jpg?key=${key}` } })
    }

    const url = await uploadBuffer(req.file.buffer, key, req.file.mimetype)
    res.json({ code: 0, data: { url } })
  } catch (e) {
    next(e)
  }
})

module.exports = router
