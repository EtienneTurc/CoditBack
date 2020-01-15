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

function clearTraceback(result) {
	if (result.user_stderr.includes("Traceback (most recent call last):\n")) {
		result.user_stderr = result.user_stderr.split("\n").slice(3).join("\n")
	}
	return result
}

exports.executeFile = (exercise, studentFilePath) => {
	return new Promise((resolve, reject) => {
		let cmd = `${config.safeexecPath} --gid ${config.sandboxGid} --nproc 4 --mem ${config.sandboxMemSize} --exec ${config.pythonPath} pythonSandbox.py ${exercise.testPath} ${studentFilePath} ${exercise.cpuTime} ${exercise.memorySize}`
		exec(cmd, (err, stdout, stderr) => {
			if (err && !stderr) {
				reject(err);
			}
			let result = {}
			if (!!stdout) {
				result = JSON.parse(stdout)
			} else {
				result.user_stderr = stderr
			}

			result = clearTraceback(result)
			result.success = isSubmissionSuccessful(result)
			resolve(result)
		});
	})
}
