const express = require("express");
const router = express.Router();
const { verificationController } = require("../controllers");
const {
  authenticate,
  isAdmin,
  validateVerifyTicket,
  validateObjectId,
} = require("../middleware");

/**
 * @route   POST /api/verify
 * @desc    Verify and check-in ticket by QR token (main scanner endpoint)
 * @access  Private/Admin (Scanner must be logged in)
 */
router.post(
  "/",
  authenticate,
  isAdmin,
  validateVerifyTicket,
  verificationController.verifyTicket
);

/**
 * @route   GET /api/verify/check/:qrToken
 * @desc    Check ticket status without marking as used (preview)
 * @access  Public (for displaying ticket status before scanning)
 */
router.get("/check/:qrToken", verificationController.checkTicketStatus);

/**
 * @route   PATCH /api/verify/checkin/:ticketId
 * @desc    Manually check-in a ticket (admin override)
 * @access  Private/Admin
 */
router.patch(
  "/checkin/:ticketId",
  authenticate,
  isAdmin,
  validateObjectId("ticketId"),
  verificationController.manualCheckIn
);

/**
 * @route   GET /api/verify/stats/:eventId
 * @desc    Get verification statistics for an event
 * @access  Private/Admin
 */
router.get(
  "/stats/:eventId",
  authenticate,
  isAdmin,
  validateObjectId("eventId"),
  verificationController.getVerificationStats
);

module.exports = router;
