const mongoose = require('mongoose')
const moveFile = require('move-file');
const config = require("../config/config.json")

const { check, executeFile } = require("../utils/utils")
const Exercise = require("../models/exercise")
const Group = require("../models/group")
const Submission = require("../models/submission")

// ========================================
// GET
// ========================================

exports.getUserInfo = async (req, res) => {
	delete req.user._id
	res.send(req.user)
}

exports.getGroup = async (req, res) => {
	check(req.query.id, 400, "Id exercise empty")

	let group = await Group.getById(req.query.id, req.query.populate)
	check(group, 404, "Group not found")

	res.send(group)
}

// TODO setup pagination
// TODO improve success get
exports.getGroups = async (req, res) => {
	let groups = await Group.getAll(req.query.populate)
	check(groups, 404, "Groups not found")

	if (req.query.withSuccess) {
		for (let group of groups) {
			for (let exercise of group.exercises) {
				exercise.success = false
				let sub = await Submission.getByExerciseAndUser(exercise._id, req.user.mail)
				exercise.success = sub ? sub.success : false
			}
		}
	}
	res.send(groups)
}

exports.getExercise = async (req, res) => {
	check(req.query.id, 400, "Id exercise empty")

	let exo = await Exercise.getById(req.query.id)
	check(exo, 404, "Exercise not found")

	if (req.query.withSuccess) {
		exo.success = false
		let submission = await Submission.getByExerciseAndUser(exo._id, req.user.mail)
		if (submission && submission.success)
			exo.success = true
	}
	res.send(exo)
}

exports.getExercises = async (req, res) => {
	let exercises
	let exos = { todo: [], done: [] }

	if (req.query.group_id) {
		let group = await Group.getById(req.query.group_id, populate = true)
		exercises = group.exercises
		delete group.exercises
		exos.group = group
	} else {
		exercises = await Exercise.getAll()
	}

	check(exercises, 404, "No exercises found")

	// TODO Improve that for loop
	for (let exo of exercises) {
		let submission = await Submission.getByExerciseAndUser(exo._id, req.user.mail)
		if (submission && submission.success) {
			exo.success = true
			exos.done.push(exo)
		}
		else
			exos.todo.push(exo)
	}
	res.send(exos)
}


// ========================================
// PUT
// ========================================

exports.updateSubmission = async (req, res) => {
	check(req.query.id, 400, "No exercise given")
	check(req.files, 400, "No file given")

	let exo = await Exercise.getById(req.query.id)
	check(exo, 404, "No exercise found")

	let result = await executeFile(exo, req.files.submission.tempFilePath)
	let previousSubmission = await Submission.getByExerciseAndUser(exo._id, req.user.mail)

	if (!previousSubmission) {
		let submission = {
			exercise: exo._id,
			user: req.user.mail,
			path: config.documentStore + "/" + exo._id + "/" + req.user.mail + ".py",
			success: result.success,
			successTime: result.success ? new Date() : null
		}
		await moveFile(req.files.submission.tempFilePath, submission.path)
		await Submission.add(submission)
	} else if (result.success || !previousSubmission.success) {
		previousSubmission.successTime = previousSubmission.success ? previousSubmission.successTime : result.success ? new Date() : null
		previousSubmission.success = result.success
		await moveFile(req.files.submission.tempFilePath, previousSubmission.path)
		await Submission.update(exo._id, previousSubmission)
	}
	res.send(result)
}

exports.updateExercise = async (req, res) => {
	let exercise = JSON.parse(req.body.exercise)
	check(exercise, 400, "No exercise given")
	check(exercise.language, 400, "No language specified")
	check(exercise.markdown, 400, "No subject given")
	check(exercise._id, 400, "No id given")

	exercise.testPath = config.documentStore + "/" + exercise._id + "/test.py"
	if (req.files && req.testFile) {
		await moveFile(req.files.testFile.tempFilePath, exercise.testPath)
	}

	if (req.files && req.files.banner) {
		exercise.banner = "/" + exercise._id + "/banner." + req.files.banner.name.split(".").pop()
		await moveFile(req.files.banner.tempFilePath, config.mediaUrl + exercise.banner)
	}

	exercise = await Exercise.update(exercise._id, exercise)
	check(exercise, 404, "Could not update the exercise")

	res.send(exercise)
}

exports.updateGroup = async (req, res) => {
	check(req.body.group._id, 400, "No id given")
	check(req.body.group, 400, "No group given")
	check(req.body.group.title, 400, "No Title specified")

	group = await Group.update(req.body.group._id, req.body.group)
	check(group, 404, "Could not update the group")

	res.send(group)
}

// ========================================
// POST
// ========================================

exports.addExercise = async (req, res) => {
	let exercise = JSON.parse(req.body.exercise)
	check(exercise, 400, "No exercise given")
	check(exercise.language, 400, "No language specified")
	check(exercise.markdown, 400, "No subject given")
	check(req.files, 400, "No file given")
	check(req.files.testFile, 400, "No file given")

	exercise._id = mongoose.Types.ObjectId();

	exercise.banner = `/default_banner_${parseInt(Math.random() * 11) + 1}.jpg`
	exercise.testPath = config.documentStore + "/" + exercise._id + "/test.py"
	// Saving test file
	await moveFile(req.files.testFile.tempFilePath, exercise.testPath)

	if (req.files.banner) {
		exercise.banner = "/" + exercise._id + "/banner." + req.files.banner.name.split(".").pop()
		await moveFile(req.files.banner.tempFilePath, config.mediaUrl + exercise.banner)
	}

	let new_exercise = await Exercise.add(exercise)
	check(new_exercise, 404, "Could not create a new exercise")

	promises = []
	for (let group_id of exercise.groups) {
		promises.push(Group.addExercise(group_id, new_exercise._id))
	}
	await Promise.all(promises)

	res.send(new_exercise)
}

exports.addGroup = async (req, res) => {
	check(req.body.group, 400, "No group given")
	check(req.body.group.title, 400, "No Title specified")

	group = await Group.add(req.body.group)
	check(group, 404, "Could not create a new group")

	res.send(group)
}
