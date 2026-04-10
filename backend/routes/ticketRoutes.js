const express = require("express");
const router = express.Router();
const { ticketController } = require("../controllers");
const {
  authenticate,
  optionalAuth,
  isAdmin,
  isAdminOrEventOwner,
  validatePurchaseTicket,
  validateObjectId,
  validatePagination,
  validateEmail,
} = require("../middleware");

/**
 * @route   POST /api/tickets/purchase
 * @desc    Purchase a ticket (guest or logged-in user)
 * @access  Public
 */
router.post(
  "/purchase",
  optionalAuth, // Optional auth - works with or without login
  validatePurchaseTicket,
  ticketController.purchaseTicket
);

/**
 * @route   GET /api/tickets/qr/:qrToken
 * @desc    Get ticket by QR token (quick access without login)
 * @access  Public
 */
router.get("/qr/:qrToken", ticketController.getTicketByQRToken);

/**
 * @route   GET /api/tickets/email/:email
 * @desc    Get all tickets by email (for guest checkout)
 * @access  Public (but should verify email ownership in production)
 */
router.get("/email/:email", validateEmail, ticketController.getTicketsByEmail);

/**
 * @route   GET /api/tickets/event/:eventId
 * @desc    Get all tickets for an event
 * @access  Private/Admin or Event Owner
 */
router.get(
  "/event/:eventId",
  authenticate,
  isAdminOrEventOwner,
  validateObjectId("eventId"),
  validatePagination,
  ticketController.getTicketsByEvent
);

/**
 * @route   GET /api/tickets/:id/qr
 * @desc    Download QR code image for ticket
 * @access  Public (anyone with ticket ID can download QR)
 */
router.get("/:id/qr", validateObjectId(), ticketController.getTicketQRCode);

/**
 * @route   GET /api/tickets/:id/details
 * @desc    Get ticket with embedded QR code data
 * @access  Public
 */
router.get("/:id/details", validateObjectId(), ticketController.getTicketWithQR);

/**
 * @route   GET /api/tickets/:id
 * @desc    Get ticket by ID
 * @access  Public (anyone with ticket ID can view)
 */
router.get("/:id", validateObjectId(), ticketController.getTicketById);

/**
 * @route   PATCH /api/tickets/:id/cancel
 * @desc    Cancel a ticket
 * @access  Private/Admin or Ticket Owner
 */
router.patch(
  "/:id/cancel",
  authenticate,
  validateObjectId(),
  ticketController.cancelTicket
);

module.exports = router;
