const express = require('express');
const { AddClassroom, getClassroomOptions, getClassrooms, EditClassroom, RemoveClassroom } = require('../Controllers/Classrooms/Classroom');
const { VerifySchool, VerifyTeacher } = require('../Middlewares/Verify');
const { getFeeForClassrooms, AddFeeForClassroom, EditFeeForClassroom, RemoveFeeForClassroom } = require('../Controllers/Classrooms/Fee');
const router = express.Router();

router.get('/classroom_options', VerifyTeacher, getClassroomOptions);

router.get('/classrooms', VerifySchool, getClassrooms);
router.post('/classroom', VerifySchool, AddClassroom);
router.put('/classroom', VerifySchool, EditClassroom);
router.delete('/classroom', VerifySchool, RemoveClassroom);

router.get('/fee/classrooms', VerifySchool, getFeeForClassrooms);
router.post('/fee/classroom', VerifySchool, AddFeeForClassroom);
router.put('/fee/classroom', VerifySchool, EditFeeForClassroom);
router.delete('/fee/classroom', VerifySchool, RemoveFeeForClassroom);

module.exports = router;