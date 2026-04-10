const express = require("express");
const router = express.Router();
const { organizerController } = require("../controllers");
const {
  authenticate,
  isAdmin,
  isOrganizer,
  isApprovedOrganizer,
  validateObjectId,
  validatePagination,
} = require("../middleware");

/**
 * @route   POST /api/organizers/register
 * @desc    Register as an organizer (user applies)
 * @access  Private (authenticated users only)
 */
router.post(
  "/register",
  authenticate,
  organizerController.registerAsOrganizer
);

/**
 * @route   GET /api/organizers/dashboard
 * @desc    Get organizer's dashboard with stats
 * @access  Private/Approved Organizer
 */
router.get(
  "/dashboard",
  authenticate,
  isApprovedOrganizer,
  organizerController.getOrganizerDashboard
);

/**
 * @route   PUT /api/organizers/profile
 * @desc    Update organizer profile
 * @access  Private/Organizer
 */
router.put(
  "/profile",
  authenticate,
  isOrganizer,
  organizerController.updateOrganizerProfile
);

/**
 * @route   GET /api/organizers/pending
 * @desc    Get pending organizer applications
 * @access  Private/Admin
 */
router.get(
  "/pending",
  authenticate,
  isAdmin,
  organizerController.getPendingOrganizers
);

/**
 * @route   GET /api/organizers
 * @desc    Get all organizers (with optional status filter)
 * @access  Private/Admin
 */
router.get(
  "/",
  authenticate,
  isAdmin,
  validatePagination,
  organizerController.getAllOrganizers
);

/**
 * @route   PUT /api/organizers/:id/approve
 * @desc    Approve organizer application
 * @access  Private/Admin
 */
router.put(
  "/:id/approve",
  authenticate,
  isAdmin,
  validateObjectId(),
  organizerController.approveOrganizer
);

/**
 * @route   PUT /api/organizers/:id/suspend
 * @desc    Suspend organizer account
 * @access  Private/Admin
 */
router.put(
  "/:id/suspend",
  authenticate,
  isAdmin,
  validateObjectId(),
  organizerController.suspendOrganizer
);

module.exports = router;
