const mongoose = require('mongoose')

const SysadminSchema = new mongoose.Schema({
	mail: {
		type: String,
		required: true,
	}
}, {
	timestamps: true,
	versionKey: false,
})

// ========================================
// METHODS
// ========================================

const Sysadmin = mongoose.model("Sysadmin", SysadminSchema)

// ========================================
// GET
// ========================================

Sysadmin.getAll = () => {
	return Sysadmin.find()
}

Sysadmin.getByMail = mail => {
	return Sysadmin.findOne({ mail: mail })
}


// ========================================
// ADD
// ========================================

Sysadmin.add = async user => {
	let a = await Sysadmin.create(user)
	return a
}

// ========================================
// UPDATE
// ========================================

Sysadmin.update = async (mail, user) => {
	let a = await Sysadmin.findOneAndUpdate({ mail: mail }, { $set: user }, { new: true })
	// check(a, 404, "Not Found")
	return a
}

// ========================================
// DELETE
// ========================================

Sysadmin.deleteByMail = async id => {
	let a = await Sysadmin.findOneAndDelete({ mail: mail })
	// check(a, 404, "Not Found")
	return a
}

Sysadmin.deleteAll = () => {
	return Sysadmin.deleteMany({})
}

module.exports = Sysadmin
