const express = require('express');
const { AddStudent, AddStudentInClassroom, getStudents, EditStudent, RemoveStudent, getStudentInClassrooms, EditStudentInClassroom, RemoveStudentInClassroom } = require('../Controllers/Students/Student');
const { CheckFees, CheckFeeAllStudent } = require('../Controllers/Students/Fee');
const { AddStudentReceipt, getStudentReceipts, EditStudentReceipt, RemoveStudentReceipt } = require('../Controllers/Students/Receipt');
const { VerifyStudent, VerifyTeacher, VerifyOfficer, VerifySchool } = require('../Middlewares/Verify');
const router = express.Router();

router.get('/students', VerifySchool, getStudents);
router.post('/student', VerifySchool, AddStudent);
router.put('/student', VerifySchool, EditStudent);
router.delete('/student', VerifySchool, RemoveStudent);

router.get('/student/classrooms', VerifySchool, getStudentInClassrooms);
router.post('/student/classroom', VerifySchool, AddStudentInClassroom);
router.put('/student/classroom', VerifySchool, EditStudentInClassroom);
router.delete('/student/classroom', VerifySchool, RemoveStudentInClassroom);

router.get('/studentReceipts', VerifySchool, getStudentReceipts);
router.post('/studentReceipt', VerifySchool, AddStudentReceipt);
router.put('/studentReceipt', VerifySchool, EditStudentReceipt);
router.delete('/studentReceipt', VerifySchool, RemoveStudentReceipt);

router.post('/student_fee_checks', VerifyStudent, CheckFees);
router.post('/student_fee_all', VerifyTeacher, CheckFeeAllStudent);
router.post('/student/receipt', VerifyOfficer, AddStudentReceipt);

module.exports = router;