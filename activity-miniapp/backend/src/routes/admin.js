// src/routes/admin.js
const router = require('express').Router()
const multer = require('multer')
const { auth, adminOnly } = require('../middleware/auth')
const auditLog = require('../middleware/auditLog')
const c = require('../controllers/adminController')
const roster = require('../controllers/schoolRosterController')

const rosterExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/\.xlsx$/i.test(file.originalname || '')) cb(null, true)
    else cb(new Error('仅支持 Excel：.xlsx'))
  },
})

router.get('/moderation/pending',               auth, adminOnly, c.listModerationPending)
router.post('/moderation/activities/:id/decide', auth, adminOnly, c.decideModeration)

router.get('/activities/:activityId/registrations', auth, c.getRegistrations)
router.post('/registrations/:id/reveal',            auth, auditLog('REVEAL_DATA'), c.revealRegistration)
router.post('/send-verify-code',                    auth, c.sendVerifyCode)
router.post('/export-registrations',                auth, auditLog('EXPORT_DATA'), c.exportRegistrations)
router.get('/activities/:activityId/analytics',     auth, c.getAnalytics)
router.get('/activities/:activityId/checkins',      auth, c.getCheckins)
router.get('/reports',                              auth, adminOnly, c.getReports)
router.put('/reports/:id/ignore',                   auth, adminOnly, c.ignoreReport)

// —— 学校学生名册 Excel 导入 ——
router.post('/rosters/import', auth, rosterExcel.single('file'), roster.importExcel)
router.get('/rosters', auth, roster.listMyRosters)
router.delete('/rosters/:id', auth, roster.deleteRoster)
router.get('/rosters/:rosterId/students', auth, roster.pageStudents)
router.get('/activities/:activityId/roster-check', auth, roster.checkActivityAgainstRoster)

module.exports = router
