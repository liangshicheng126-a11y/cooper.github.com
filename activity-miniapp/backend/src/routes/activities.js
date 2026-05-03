// src/routes/activities.js
const router = require('express').Router()
const { auth, softAuth } = require('../middleware/auth')
const { validate, schemas } = require('../middleware/validate')
const c = require('../controllers/activityController')

router.get('/',                    softAuth, c.list)
router.get('/featured',            c.featured)
router.get('/my-created',          auth, c.myCreated)
router.post('/',                   auth, validate(schemas.createActivity), c.create)
router.patch('/:id/wx-group',       auth, c.patchWxGroupChat)
router.get('/:id',                 softAuth, c.getById)
router.put('/:id',                 auth, c.update)
router.put('/:id/offline',         auth, c.offline)
router.get('/:id/sub-activities',  c.getSubActivities)
router.get('/:id/my-registration', softAuth, c.myRegistration)
router.get('/:id/qrcode',          auth, c.getQRCode)
router.get('/:id/checkin-qrcode',  auth, c.getCheckinQRCode)
router.post('/:id/notify-all',     auth, c.notifyAll)
router.post('/report',             auth, c.report)

module.exports = router
