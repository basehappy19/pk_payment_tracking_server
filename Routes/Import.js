const express = require('express');
const { getImportOptions } = require('../Controllers/Import');
const { VerifySchool } = require('../Middlewares/Verify');
const router = express.Router();

router.get('/import_options', VerifySchool, getImportOptions);

module.exports = router;