const config = require("../config/config.json")
const { exec } = require('child_process');

exports.check = (el, status, message) => {
	if (!el) throw { status, message }
}

exports.executeFile = (exercise, studentFilePath) => {
	return new Promise((resolve, reject) => {
		let cmd = `/home/etienne/safeexec/safeexec --gid ${config.sandboxGid} --nproc 4 --mem ${config.sandboxMemSize} --exec ${config.pythonPath} pythonSandbox.py ${exercise.testPath} ${studentFilePath} ${exercise.cpuTime} ${exercise.memorySize}`
		exec(cmd, (err, stdout, stderr) => {
			if (err) {
				// node couldn't execute the command
				reject(err);
			}
			resolve(JSON.parse(stdout))
		});
	})
}
