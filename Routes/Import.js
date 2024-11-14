const express = require('express');
const { getImportOptions, AddImportData, AddImportDataByCSV } = require('../Controllers/Import');
const { VerifySchool } = require('../Middlewares/Verify');
const router = express.Router();

router.get('/import_options', VerifySchool, getImportOptions);
router.post('/import', VerifySchool, AddImportData);
router.post('/import_csv', VerifySchool, AddImportDataByCSV);

module.exports = router;