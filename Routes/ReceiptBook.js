const express = require('express');
const { getReceiptBooks, AddReceiptBook, EditReceiptBook, RemoveReceiptBook, getReceiptBookOptions } = require('../Controllers/ReceiptBooks/ReceiptBook');
const { VerifySchool } = require('../Middlewares/Verify');
const router = express.Router();


router.get('/receiptBookOptions', VerifySchool, getReceiptBookOptions);
router.get('/receiptBooks', getReceiptBooks);
router.post('/receiptBook', AddReceiptBook);
router.put('/receiptBook', EditReceiptBook);
router.delete('/receiptBook', RemoveReceiptBook);

module.exports = router;