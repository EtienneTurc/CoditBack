const { check, executeFile, markdownToHtml } = require("../utils/utils")

const Exercise = require("../models/exercise")

// GET

exports.getExercise = async (req, res) => {
	check(req.query.id, 400, "Id exercise empty")

	let exo = await Exercise.getById(req.query.id)
	check(exo, 404, "Exercise not found")

	exo.subject = markdownToHtml(exo.markdown)

	res.send(exo)
}

exports.getExercises = async (req, res) => {
	let exercises = await Exercise.getAll(req.query.id)
	check(exercises, 404, "No exercises yet")

	// TODO forof async
	for (let exo of exercises) {
		exo.subject = markdownToHtml(exo.markdown)
	}

	res.send(exercises)
}

// POST

exports.postExercise = async (req, res) => {
	// TODO wrap this better
	check(req.body, 400, "No exercise given")
	check(req.body.language, 400, "No language specified")
	check(req.body.markdown, 400, "No subject given")

	let exercise = await Exercise.add(req.body)
	check(exercise, 404, "Could not create a new exercise")
	exercise.subject = markdownToHtml(exercise.markdown)

	res.send(exercise)
}

exports.postSolution = async (req, res) => {
	// TODO Download file
	check(req.query.file, 400, "No file given")
	let stdout = executeFile(req.query.file)

	res.send(stdout)
}
