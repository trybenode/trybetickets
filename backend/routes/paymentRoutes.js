const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

/**
 * @route   POST /api/payments/initialize
 * @desc    Initialize payment for ticket purchase
 * @access  Public
 */
router.post('/initialize', paymentController.initializeTicketPayment);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment and create ticket
 * @access  Public
 */
router.post('/verify', paymentController.verifyTicketPayment);

/**
 * @route   POST /api/payments/webhook
 * @desc    Paystack webhook handler
 * @access  Public (Paystack only)
 */
router.post('/webhook', paymentController.handlePaystackWebhook);

module.exports = router;
