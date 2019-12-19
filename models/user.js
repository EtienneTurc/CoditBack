const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	mail: {
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

const User = mongoose.model("User", UserSchema)

// ========================================
// GET
// ========================================

User.getAll = () => {
	return User.find()
}

User.getByMail = mail => {
	return User.find({ mail: mail })
}


// ========================================
// ADD
// ========================================

User.add = async user => {
	let a = await User.create(user)
	return a
}

// ========================================
// UPDATE
// ========================================

User.update = async (mail, user) => {
	let a = await User.findOneAndUpdate({ mail: mail }, { $set: user }, { new: true })
	// check(a, 404, "Not Found")
	return a
}

// ========================================
// DELETE
// ========================================

User.deleteByMail = async id => {
	let a = await User.findOneAndDelete({ mail: mail })
	// check(a, 404, "Not Found")
	return a
}

User.deleteAll = () => {
	return User.deleteMany({})
}

module.exports = User
