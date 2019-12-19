const mongoose = require('mongoose')

const ActionSchema = new mongoose.Schema({
	exercise: {
		type: mongoose.Schema.ObjectId,
		ref: "Exercise",
		required: true,
	},
	user: {
		type: String,
		required: true,
	},
	passed: {
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

const Action = mongoose.model("Action", ActionSchema)

// ========================================
// GET
// ========================================

Action.getAll = () => {
	return Action.find()
}

Action.getAllByUser = mail => {
	return Action.find({ user: mail })
}

Action.getAllByExercise = id => {
	return Action.find({ exercise: id })
}


// ========================================
// ADD
// ========================================

Action.add = async action => {
	let a = await Action.create(action)
	return a
}

// ========================================
// UPDATE
// ========================================

Action.update = async (id, action) => {
	let a = await Action.findOneAndUpdate({ _id: id }, { $set: action }, { new: true })
	// check(a, 404, "Not Found")
	return a
}

// ========================================
// DELETE
// ========================================

Action.deleteById = async id => {
	let a = await Action.findOneAndDelete({ _id: id })
	// check(a, 404, "Not Found")
	return a
}

Action.deleteAll = () => {
	return Action.deleteMany({})
}

module.exports = Action
