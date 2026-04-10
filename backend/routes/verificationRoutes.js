const express = require("express");
const router = express.Router();
const { verificationController } = require("../controllers");
const {
  authenticate,
  isAdmin,
  isApprovedOrganizer,
  isAdminOrEventOwner,
  validateVerifyTicket,
  validateObjectId,
} = require("../middleware");

/**
 * @route   POST /api/verify
 * @desc    Verify and check-in ticket by QR token (main scanner endpoint)
 * @access  Private/Approved Organizer (Scanner must be logged in and approved)
 */
router.post(
  "/",
  authenticate,
  isApprovedOrganizer,
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
 * @desc    Manually check-in a ticket (admin or event owner override)
 * @access  Private/Approved Organizer
 */
router.patch(
  "/checkin/:ticketId",
  authenticate,
  isApprovedOrganizer,
  validateObjectId("ticketId"),
  verificationController.manualCheckIn
);

/**
 * @route   GET /api/verify/stats/:eventId
 * @desc    Get verification statistics for an event
 * @access  Private/Admin or Event Owner
 */
router.get(
  "/stats/:eventId",
  authenticate,
  isAdminOrEventOwner,
  validateObjectId("eventId"),
  verificationController.getVerificationStats
);

module.exports = router;
