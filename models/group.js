const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		unique: true
	},
	exercises: [{
		type: mongoose.Schema.ObjectId,
		ref: "Exercise",
	}],
	description: {
		type: String,
	},
	startTime: Date,
	endTime: Date,
}, {
	timestamps: true,
	versionKey: false,
})

// ========================================
// METHODS
// ========================================

const Group = mongoose.model("Group", GroupSchema)

// ========================================
// GET
// ========================================

Group.getAll = (populate = false) => {
	let a = Group.find()
	return populate ? a.populate('exercises').lean() : a.lean()
}


Group.getById = (id, populate = false) => {
	let a = Group.findOne({ _id: id })
	return populate ? a.populate('exercises').lean() : a.lean()
}


// ========================================
// ADD
// ========================================

Group.add = async group => {
	let a = await Group.create(group)
	return a
}

// ========================================
// UPDATE
// ========================================

Group.update = async (id, group) => {
	let a = await Group.findOneAndUpdate({ _id: id }, { $set: group }, { new: true })
	return a
}

Group.addExercise = async (id, exercise_id) => {
	let a = await Group.findOneAndUpdate({ _id: id, 'exercises': { $ne: exercise_id } }, { $push: { 'exercises': exercise_id } }, { new: true })
	return a
}

// ========================================
// DELETE
// ========================================

Group.deleteAll = () => {
	return Group.deleteMany({})
}

module.exports = Group
