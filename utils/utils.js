const marked = require('marked');

const config = require("../config/config.json")
const { exec } = require('child_process');

exports.check = (el, status, message) => {
	if (!el) throw { status, message }
}

exports.executeFile = (exercise, studentFilePath) => {
	let cmd = `/home/etienne/safeexec/safeexec --gid ${config.sandboxGid} --nproc 4 --mem ${config.sandboxMemSize} --exec ${config.pythonPath} pythonSandbox.py ${exercice.testPath} ${studentFilePath} ${exercise.cpuTime} ${exercise.memorySize}`
	exec(cmd, (err, stdout, stderr) => {
		if (err) {
			// node couldn't execute the command
			console.log("err", err)
			return;
		}

		// the *entire* stdout and stderr (buffered)
		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);
		console.log(JSON.parse(stdout))
		return stdout
	});
}

exports.markdownToHtml = markdown => {
	return marked(markdown);
}
