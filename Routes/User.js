const express = require('express')
const router = express.Router()

const { AddUser, AllUsers, EditUser, RemoveUser, getRoleOptions } = require('../Controllers/User');
const { VerifySchool } = require('../Middlewares/Verify');

router.get("/role_options", VerifySchool, getRoleOptions)
router.get("/users", VerifySchool, AllUsers)
router.post("/user", VerifySchool, AddUser)
router.put("/user", VerifySchool, EditUser)
router.delete("/user", VerifySchool, RemoveUser)

module.exports = router