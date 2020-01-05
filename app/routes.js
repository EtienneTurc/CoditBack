const router = require('express').Router()
const ctrl = require('./controllers')


router.get("/user", ctrl.getUserInfo)
router.get("/exercise", ctrl.getExercise)
router.get("/exercises", ctrl.getExercises)

router.put("/submission", ctrl.updateSubmission)
router.put("/exercise", ctrl.updateExercise)

router.post("/exercise", ctrl.postExercise)

module.exports = router
