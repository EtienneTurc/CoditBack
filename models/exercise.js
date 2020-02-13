const mongoose = require('mongoose')

const ExerciseSchema = new mongoose.Schema({
	uploaderMail: {
		type: String,
		required: true
	},
	markdown: {
		type: String,
		required: true,
		unique: true,
	},
	testPath: {
		type: String,
		required: true,
		unique: true
	},
	functionName: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	showTitle: {
		type: Boolean,
		default: false
	},
	banner: {
		type: String,
	},
	difficulty: {
		type: Number,
		min: 1,
		max: 5
	},
	language: {
		type: String,
		enum: ["Python3"],
		default: "Python3"
	},
	cpuTime: {
		type: Number,
		default: 3
	},
	memorySize: {
		type: Number,
		default: 10000
	}
}, {
	timestamps: true,
	versionKey: false,
})

// ========================================
// METHODS
// ========================================

const Exercise = mongoose.model("Exercise", ExerciseSchema)

// ========================================
// GET
// ========================================

Exercise.getAll = () => {
	return Exercise.find().lean()
}

Exercise.getById = id => {
	return Exercise.findOne({ _id: id }).lean()
}

Exercise.getByUploader = uploaderMail => {
	return Exercise.find({ uploaderMail: uploaderMail })
}


// ========================================
// ADD
// ========================================

Exercise.add = async exercise => {
	let a = await Exercise.create(exercise)
	return a
}

// ========================================
// UPDATE
// ========================================

Exercise.update = async (id, exercise) => {
	let a = await Exercise.findOneAndUpdate({ _id: id }, { $set: exercise }, { new: true })
	return a
}

// ========================================
// DELETE
// ========================================

Exercise.deleteById = async id => {
	let a = await Exercise.findOneAndDelete({ _id: id })
	return a
}

Exercise.deleteAll = () => {
	return Exercise.deleteMany({})
}

module.exports = Exercise
