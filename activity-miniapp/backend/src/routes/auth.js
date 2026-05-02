// src/routes/auth.js
const router = require('express').Router()
const { auth } = require('../middleware/auth')
const c = require('../controllers/authController')

router.post('/login', c.login)
router.get('/profile', auth, c.getProfile)
router.delete('/account', auth, c.deleteAccount)
router.post('/export-data', auth, c.exportData)

module.exports = router
