const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');

// 📝 Add Funds to User Payment Method
router.post('/funds/add', paymentsController.addFunds);

// 📝 Process Payment for Accepted Offer
router.post('/pay', paymentsController.processPayment);

// 📝 Get Payment Details for a User
router.get('/user/:user_id', paymentsController.getUserPayments);

// 📝 Get Transaction History for a User
router.get('/transactions/:user_id', paymentsController.getTransactionHistory);

router.get('/balance', paymentsController.getUserBalance);
router.get('/offers', paymentsController.getUserAcceptedOffers);
router.get('/history', paymentsController.getPaymentHistory);
router.post('/pay', paymentsController.makePayment);

module.exports = router;
