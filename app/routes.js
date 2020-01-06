const router = require('express').Router()
const ctrl = require('./controllers')

const adminCheck = require('../config/passport').adminCheck

router.get("/user", ctrl.getUserInfo)
router.get("/exercise", ctrl.getExercise)
router.get("/exercises", ctrl.getExercises)

router.put("/submission", ctrl.updateSubmission)
router.put("/exercise", adminCheck, ctrl.updateExercise)

router.post("/exercise", adminCheck, ctrl.postExercise)

module.exports = router
