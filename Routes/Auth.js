const express = require('express');
const { UserLogin, StudentLogin, getUserData } = require('../Controllers/Auth');
const router = express.Router();

router.post('/student_login', StudentLogin)
router.post('/user_login', UserLogin)
router.get('/user_data', getUserData)

module.exports = router;