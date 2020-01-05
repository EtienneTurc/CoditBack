const passport = require('passport')
const express = require('express')
const router = express.Router()

router.get('/', passport.authenticate('cas'), (req, res) => {
	res.redirect(req.query.next || '/')
})

module.exports = router
