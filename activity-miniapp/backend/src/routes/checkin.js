// src/routes/checkin.js
const router = require('express').Router()
const { auth } = require('../middleware/auth')
const c = require('../controllers/checkinController')

router.post('/',            auth, c.checkin)
router.get('/:activityId',  auth, c.getCheckinQRData)

module.exports = router
