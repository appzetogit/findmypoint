const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  getTransactionsByBusiness,
  refundTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All transaction routes require authentication

router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/business/:businessId', getTransactionsByBusiness);
router.put('/:txnId/refund', refundTransaction);

module.exports = router;
