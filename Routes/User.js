const express = require('express')
const router = express.Router()

const { AddUser, AddRole } = require('../Controllers/User');
const { VerifySchool } = require('../Middlewares/Verify');

router.post("/user", VerifySchool, AddUser)
router.post("/user/add/role", VerifySchool, AddRole)

module.exports = router