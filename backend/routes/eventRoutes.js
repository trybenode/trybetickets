const express = require("express");
const router = express.Router();
const { eventController } = require("../controllers");
const {
  authenticate,
  isAdmin,
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
 * @route   GET /api/events/:id
 * @desc    Get single event by ID
 * @access  Public
 */
router.get("/:id", validateObjectId(), eventController.getEventById);

/**
 * @route   POST /api/events
 * @desc    Create new event
 * @access  Private/Admin
 */
router.post(
  "/",
  authenticate,
  isAdmin,
  validateCreateEvent,
  eventController.createEvent
);

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authenticate,
  isAdmin,
  validateObjectId(),
  validateUpdateEvent,
  eventController.updateEvent
);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event (soft delete if tickets sold)
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authenticate,
  isAdmin,
  validateObjectId(),
  eventController.deleteEvent
);

/**
 * @route   GET /api/events/:id/analytics
 * @desc    Get event analytics and statistics
 * @access  Private/Admin
 */
router.get(
  "/:id/analytics",
  authenticate,
  isAdmin,
  validateObjectId(),
  eventController.getEventAnalytics
);

module.exports = router;
