const { check, executeFile, markdownToHtml } = require("../utils/utils")

const Exercise = require("../models/exercise")

exports.getExercise = async (req, res) => {
	check(req.query.id, 400, "Id exercise empty")

	let exo = await Exercise.getById(req.query.id)
	check(exo, 404, "Exercise not found")

	exo.subject = markdownToHtml(exo.markdown)

	res.send(exo)
}

exports.postSolution = async (req, res) => {
	// TODO Download file
	check(req.query.file, 400, "No file given")
	let stdout = executeFile(req.query.file)

	res.send(stdout)
}
