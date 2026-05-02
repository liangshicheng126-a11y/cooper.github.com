// src/routes/admin.js
const router = require('express').Router()
const { auth } = require('../middleware/auth')
const auditLog = require('../middleware/auditLog')
const c = require('../controllers/adminController')

router.get('/activities/:activityId/registrations', auth, c.getRegistrations)
router.post('/registrations/:id/reveal',            auth, auditLog('REVEAL_DATA'), c.revealRegistration)
router.post('/send-verify-code',                    auth, c.sendVerifyCode)
router.post('/export-registrations',                auth, auditLog('EXPORT_DATA'), c.exportRegistrations)
router.get('/activities/:activityId/analytics',     auth, c.getAnalytics)
router.get('/activities/:activityId/checkins',      auth, c.getCheckins)
router.get('/reports',                              auth, c.getReports)
router.put('/reports/:id/ignore',                   auth, c.ignoreReport)

module.exports = router
