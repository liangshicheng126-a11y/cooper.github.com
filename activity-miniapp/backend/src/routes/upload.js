// src/routes/upload.js
const router = require('express').Router()
const multer = require('multer')
const { auth } = require('../middleware/auth')
const COS = require('cos-nodejs-sdk-v5')
const { v4: uuidv4 } = require('uuid')
const path = require('path')

const cos = new COS({
  SecretId: process.env.TENCENT_SECRET_ID,
  SecretKey: process.env.TENCENT_SECRET_KEY,
})

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

    await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: process.env.COS_BUCKET,
        Region: process.env.COS_REGION,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }, (err) => err ? reject(err) : resolve())
    })
    const url = `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/${key}`
    res.json({ code: 0, data: { url } })
  } catch (e) {
    next(e)
  }
})

module.exports = router
