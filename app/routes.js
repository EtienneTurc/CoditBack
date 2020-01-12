const router = require('express').Router()
const ctrl = require('./controllers')

const adminCheck = require('../config/passport').adminCheck

router.get("/user", ctrl.getUserInfo)
router.get("/group", ctrl.getGroup)
router.get("/groups", ctrl.getGroups)
router.get("/exercise", ctrl.getExercise)
router.get("/exercises", ctrl.getExercises)

router.put("/submission", ctrl.updateSubmission)
router.put("/exercise", adminCheck, ctrl.updateExercise)
router.put("/group", adminCheck, ctrl.updateGroup)

router.post("/exercise", adminCheck, ctrl.addExercise)
router.post("/group", adminCheck, ctrl.addGroup)

module.exports = router
