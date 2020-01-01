const mongoose = require('mongoose')

const SolutionSchema = new mongoose.Schema({
	solution: {
		type: mongoose.Schema.ObjectId,
		ref: "Exercise",
		required: true,
	},
	uploaderMail: {
		type: String,
		required: true
	},
	path: {
		type: String,
		required: true,
		unique: true,
	}
}, {
	timestamps: true,
	versionKey: false,
})

// ========================================
// METHODS
// ========================================

const Solution = mongoose.model("Solution", SolutionSchema)

// ========================================
// GET
// ========================================

Solution.getAll = () => {
	return Solution.find().lean()
}

Solution.getByUploader = uploaderMail => {
	return Solution.find({ uploaderMail: uploaderMail })
}


// ========================================
// ADD
// ========================================

Solution.add = async solution => {
	let a = await Solution.create(solution)
	return a
}

// ========================================
// UPDATE
// ========================================

Solution.update = async (id, solution) => {
	let a = await Solution.findOneAndUpdate({ _id: id }, { $set: solution }, { new: true })
	// check(a, 404, "Not Found")
	return a
}

// ========================================
// DELETE
// ========================================

Solution.deleteById = async id => {
	let a = await Solution.findOneAndDelete({ _id: id })
	// check(a, 404, "Not Found")
	return a
}

Solution.deleteAll = () => {
	return Solution.deleteMany({})
}

module.exports = Solution
