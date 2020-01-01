const express = require('express')
const app = express()
require('express-async-errors')

const mongoose = require('mongoose')
const cors = require('cors')
const fileUpload = require('express-fileupload')

const config = require("./config/config.json")

mongoose.Promise = global.Promise
mongoose.connect(config.database, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors({ credentials: true, origin: true }))

app.use(fileUpload({
	useTempFiles: true,
	tempFileDir: '/tmp/',
	debug: true
}));

app.use('/static', express.static('media'))
app.use("/", require("./app/routes.js"))

app.use((err, req, res, next) => {
	if (res.headersSent)
		return next(err)
	console.error(err.status, err.message)
	res.status(err.status || 500).json({ message: err.message || err })
})

app.listen(config.port, () => {
	console.log("Server listening on port " + config.port)
})
