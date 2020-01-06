const mongoose = require('mongoose')

const SubmissionSchema = new mongoose.Schema({
	exercise: {
		type: mongoose.Schema.ObjectId,
		ref: "Exercise",
		required: true,
	},
	path: {
		type: String
	},
	user: {
		type: String,
		required: true,
	},
	success: {
		type: Boolean,
		default: false
	},
}, {
	timestamps: true,
	versionKey: false,
})

// ========================================
// METHODS
// ========================================

const Submission = mongoose.model("Submission", SubmissionSchema)

// ========================================
// GET
// ========================================

Submission.getAll = () => {
	return Submission.find()
}

Submission.getAllByUser = mail => {
	return Submission.find({ user: mail })
}

Submission.getAllByExercise = id => {
	return Submission.find({ exercise: id })
}

Submission.getByExerciseAndUser = (id, mail) => {
	return Submission.findOne({ exercise: id, user: mail })
}

// ========================================
// ADD
// ========================================

Submission.add = async submission => {
	let a = await Submission.create(submission)
	return a
}

// ========================================
// UPDATE
// ========================================

Submission.update = async (id, submission) => {
	let a = await Submission.findOneAndUpdate({ exercise: id }, { $set: submission }, { new: true })
	return a
}

// ========================================
// DELETE
// ========================================

Submission.deleteById = async id => {
	let a = await Submission.findOneAndDelete({ _id: id })
	// check(a, 404, "Not Found")
	return a
}

Submission.deleteAll = () => {
	return Submission.deleteMany({})
}

module.exports = Submission
