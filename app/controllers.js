const mongoose = require('mongoose')
const moveFile = require('move-file');
const config = require("../config/config.json")

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

// PUT

exports.updateSubmission = async (req, res) => {
	check(req.query.id, 400, "No exercise given")
	let exo = await Exercise.getById(req.query.id)
	check(exo, 404, "No exercise found")

	check(req.files, 400, "No file given")

	let stdout = executeFile(exo, req.files.submission.tempFilePath)
	res.send(stdout)
}

// POST

exports.postExercise = async (req, res) => {
	let exercise = JSON.parse(req.body.exercise)
	check(exercise, 400, "No exercise given")
	check(exercise.language, 400, "No language specified")
	check(exercise.markdown, 400, "No subject given")
	check(req.files, 400, "No file given")
	check(req.files.testFile, 400, "No file given")

	exercise._id = mongoose.Types.ObjectId();

	exercise.testPath = config.documentStore + "/" + exercise._id + "/test.py"
	// Saving test file
	await moveFile(req.files.testFile.tempFilePath, exercise.testPath)

	exercise = await Exercise.add(exercise)
	check(exercise, 404, "Could not create a new exercise")

	exercise.subject = markdownToHtml(exercise.markdown)
	res.send(exercise)
}
