// src/routes/ai.js
const router = require('express').Router()
const { auth } = require('../middleware/auth')
const rateLimit = require('express-rate-limit')
const aiPosterService = require('../services/aiPosterService')

const aiLimiter = rateLimit({ windowMs: 60000, max: 5, message: { code: 429, message: 'AI 生成请求过于频繁' } })

router.post('/generate-poster', auth, aiLimiter, aiPosterService.generatePoster)

module.exports = router
