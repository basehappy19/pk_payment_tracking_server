const express = require('express');
const router = express.Router();
const { AddFee, getFees, RemoveFee, EditFee, getFeeOptions } = require('../Controllers/Fees/Fee');
const { VerifySchool } = require('../Middlewares/Verify');

router.get('/feeOptions', VerifySchool, getFeeOptions);
router.get('/fees', VerifySchool, getFees);
router.post('/fee', VerifySchool, AddFee);
router.put('/fee', VerifySchool, EditFee);
router.delete('/fee', VerifySchool, RemoveFee);


module.exports = router;