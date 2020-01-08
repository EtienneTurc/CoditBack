const config = require("../config/config.json")
const { exec } = require('child_process');

exports.check = (el, status, message) => {
	if (!el) throw { status, message }
}

function isSubmissionSuccessful(result) {
	let arr = result.user_stderr.split("\n")
	if (arr[arr.length - 2] == "OK")
		return true
	return false
}

exports.executeFile = (exercise, studentFilePath) => {
	return new Promise((resolve, reject) => {
		let cmd = `/home/etienne/safeexec/safeexec --gid ${config.sandboxGid} --nproc 4 --mem ${config.sandboxMemSize} --exec ${config.pythonPath} pythonSandbox.py ${exercise.testPath} ${studentFilePath} ${exercise.cpuTime} ${exercise.memorySize}`
		exec(cmd, (err, stdout, stderr) => {
			if (err) {
				reject(err);
			}
			let result = JSON.parse(stdout)
			result.success = isSubmissionSuccessful(result)
			resolve(result)
		});
	})
}
