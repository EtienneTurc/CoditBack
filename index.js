const express = require('express')
const app = express()

const mongoose = require('mongoose')
const cors = require('cors')

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

app.use("/", require("./app/routes.js"))

app.listen(config.port, () => {
	console.log("Server listening on port " + config.port)
})
