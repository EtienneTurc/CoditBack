const passport = require('passport')
const CasStrategy = require('@jcu/passport-cas').Strategy

const User = require('../models/user.js')
const Sysadmin = require('../models/sysadmin.js')
const config = require('./config')

exports.loginCheck = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next()
	} else {
		res.status(401).json({ message: "Unauthorized" })
	}
}

exports.adminCheck = function (req, res, next) {
	if (req.user.isAdmin) {
		return next()
	} else {
		res.status(401).json({ message: "Not an admin" })
	}
}

// Passport strategy for cas authentication
exports.main = function (app) {
	passport.use(new CasStrategy({
		version: 'CAS3.0',
		ssoBaseURL: 'https://cascad.ensta.fr',
		validateURL: '/serviceValidate',
		serverBaseURL: config.url,
	}, async (profile, done) => {
		let full_user = {
			_id: null,
			firstName: "",
			lastName: "",
			mail: "",
			isAdmin: false
		}
		try {
			let user = await User.getByMail(profile.email)
			if (user) {
				full_user._id = user._id
				full_user.firstName = user.firstName
				full_user.lastName = user.lastName
				full_user.mail = user.mail
			} else {
				full_user.firstName = profile.first_name
				full_user.lastName = profile.last_name
				full_user.mail = profile.email
				await User.add(full_user)
			}

			let admin = await Sysadmin.getByMail(full_user.mail)
			full_user.isAdmin = !!admin

			return done(null, full_user)
		} catch (error) {
			return done(err, false)
		}
	}))

	app.use(passport.initialize())
	app.use(passport.session())

	passport.serializeUser(function (user, done) {
		done(null, user)
	})
	passport.deserializeUser(function (user, done) {
		done(null, user)
	})
}
