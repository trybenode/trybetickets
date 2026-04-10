const express = require("express");
const router = express.Router();
const { eventController } = require("../controllers");
const {
  authenticate,
  isAdmin,
  isApprovedOrganizer,
  isAdminOrEventOwner,
  validateCreateEvent,
  validateUpdateEvent,
  validateObjectId,
  validatePagination,
} = require("../middleware");

/**
 * @route   GET /api/events
 * @desc    Get all events (with filters and pagination)
 * @access  Public
 */
router.get("/", validatePagination, eventController.getAllEvents);

/**
 * @route   GET /api/events/my-events
 * @desc    Get organizer's own events
 * @access  Private/Approved Organizer
 */
router.get(
  "/my-events",
  authenticate,
  isApprovedOrganizer,
  validatePagination,
  eventController.getMyEvents
);

/**
 * @route   GET /api/events/:id
 * @desc    Get single event by ID
 * @access  Public
 */
router.get("/:id", validateObjectId(), eventController.getEventById);

/**
 * @route   POST /api/events
 * @desc    Create new event
 * @access  Private/Approved Organizer
 */
router.post(
  "/",
  authenticate,
  isApprovedOrganizer,
  validateCreateEvent,
  eventController.createEvent
);

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private/Admin or Event Owner
 */
router.put(
  "/:id",
  authenticate,
  isAdminOrEventOwner,
  validateObjectId(),
  validateUpdateEvent,
  eventController.updateEvent
);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event (soft delete if tickets sold)
 * @access  Private/Admin or Event Owner
 */
router.delete(
  "/:id",
  authenticate,
  isAdminOrEventOwner,
  validateObjectId(),
  eventController.deleteEvent
);

/**
 * @route   GET /api/events/:id/analytics
 * @desc    Get event analytics and statistics
 * @access  Private/Admin or Event Owner
 */
router.get(
  "/:id/analytics",
  authenticate,
  isAdminOrEventOwner,
  validateObjectId(),
  eventController.getEventAnalytics
);

module.exports = router;
