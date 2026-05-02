// src/routes/registrations.js
const router = require('express').Router()
const { auth } = require('../middleware/auth')
const { validate, schemas } = require('../middleware/validate')
const c = require('../controllers/registrationController')

router.post('/',                auth, validate(schemas.register), c.create)
router.get('/my',               auth, c.myRegistrations)
router.get('/check-conflict',   auth, c.checkConflict)
router.delete('/:id',           auth, c.cancel)

module.exports = router
