const router = require('express').Router()
const { exec } = require('child_process');

const config = require("../config/config.json")

const ctrl = require('./controllers')

router.get("/exec", (req, res) => {
	let filePath = "main.py"
	let cmd = `/home/etienne/safeexec/safeexec --gid ${config.sandboxGid} --nproc 4 --mem ${config.sandboxMemSize} --exec ${config.pythonPath} pythonSandbox.py ${filePath}`
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
		res.send(JSON.parse(stdout).user_stdout)
	});
})

router.get("/exercise", ctrl.getExercise)
router.get("/exercises", ctrl.getExercises)
router.post("/exercise", ctrl.postExercise)
router.post("/solution", ctrl.postSolution)

module.exports = router
