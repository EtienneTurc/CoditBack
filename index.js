const express = require('express')
const app = express()
const session = require('express-session')
const fileUpload = require('express-fileupload')
require('express-async-errors')

const config = require("./config/config.json")
const fs = require('fs')
const mongoose = require('mongoose')
const cors = require('cors')

const server = require('https').Server({
	key: fs.readFileSync('config/ssl.key'),
	cert: fs.readFileSync('config/ssl.crt'),
}, app)

mongoose.Promise = global.Promise
mongoose.connect(config.database, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(require('helmet')());
app.use(cors({ credentials: true, origin: true }))

app.use(fileUpload({
	useTempFiles: true,
	tempFileDir: '/tmp/',
	debug: true
}));

const MongoStore = require('connect-mongo')(session);
const store = new MongoStore({
	url: config.database,
	secret: config.storeSecret
})

app.use(session({
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: true,
	store: store
}))

require('./config/passport').main(app)
const loginCheck = require('./config/passport').loginCheck

app.get('/logout', function (req, res) {
	req.logout()
	res.redirect(req.query.next || config.frontUrl)
})

app.use('/login', require('./app/login'))
app.use("/", loginCheck, require("./app/routes.js"))

app.use('/static', express.static('media'))

app.use((err, req, res, next) => {
	if (res.headersSent)
		return next(err)
	console.error(err.status, err.message)
	res.status(err.status || 500).json({ message: err.message || err })
})

server.listen(config.port, () => {
	console.log("Server listening on port " + config.port)
})
