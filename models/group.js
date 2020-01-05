const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
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

Group.getAll = () => {
	return Group.find()
}

Group.getById = id => {
	return Group.find({ _id: id })
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
	// check(a, 404, "Not Found")
	return a
}

// ========================================
// DELETE
// ========================================

Group.deleteAll = () => {
	return Group.deleteMany({})
}

module.exports = Group
