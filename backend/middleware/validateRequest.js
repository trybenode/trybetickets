/**
 * Request Validation Middleware
 * Validates request body against defined schemas
 */

const { body, param, query, validationResult } = require("express-validator");

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }

  next();
};

/**
 * Validation rules for creating an event
 */
const validateCreateEvent = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("category")
    .optional()
    .trim()
    .isIn([
      'Music & Concerts',
      'Sports & Fitness',
      'Arts & Culture',
      'Food & Drink',
      'Business & Professional',
      'Technology & Innovation',
      'Health & Wellness',
      'Education & Career',
      'Community & Social',
      'Film & Media',
      'Fashion & Beauty',
      'Travel & Outdoor',
      'Charity & Causes',
      'Family & Kids',
      'Other'
    ])
    .withMessage("Invalid category"),

  body("date")
    .notEmpty()
    .withMessage("Event date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Event date must be in the future");
      }
      return true;
    }),

  body("venue").trim().notEmpty().withMessage("Venue is required"),

  body("eventCapacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Event capacity must be at least 1"),

  body("ticketPrice")
    .notEmpty()
    .withMessage("Ticket price is required")
    .isFloat({ min: 0 })
    .withMessage("Ticket price must be a positive number"),

  body("totalTickets")
    .notEmpty()
    .withMessage("Total tickets is required")
    .isInt({ min: 1 })
    .withMessage("Total tickets must be at least 1"),

  body("organizerName").trim().notEmpty().withMessage("Organizer name is required"),

  body("organizerContact").optional().trim(),

  body("ticketTypesData")
    .optional()
    .isArray()
    .withMessage("Ticket types must be an array"),

  body("ticketTypesData.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Ticket type name is required"),

  body("ticketTypesData.*.price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Ticket type price must be positive"),

  body("ticketTypesData.*.quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Ticket type quantity must be at least 1"),

  validate,
];

/**
 * Validation rules for updating an event
 */
const validateUpdateEvent = [
  body("title")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Event date must be in the future");
      }
      return true;
    }),

  body("ticketPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Ticket price must be a positive number"),

  body("totalTickets")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Total tickets must be at least 1"),

  body("status")
    .optional()
    .isIn(["active", "inactive", "completed", "cancelled"])
    .withMessage("Invalid status"),

  validate,
];

/**
 * Validation rules for purchasing a ticket
 */
const validatePurchaseTicket = [
  body("eventId").notEmpty().withMessage("Event ID is required").isMongoId().withMessage("Invalid event ID"),

  body("buyerName").trim().notEmpty().withMessage("Buyer name is required"),

  body("buyerEmail")
    .trim()
    .notEmpty()
    .withMessage("Buyer email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("buyerPhone").trim().notEmpty().withMessage("Buyer phone is required"),

  body("userId").optional().isMongoId().withMessage("Invalid user ID"),

  validate,
];

/**
 * Validation rules for verifying a ticket
 */
const validateVerifyTicket = [
  body("qrToken").trim().notEmpty().withMessage("QR token is required"),

  body("checkedInBy").optional().trim(),

  validate,
];

/**
 * Validation rules for MongoDB ObjectId params
 */
const validateObjectId = (paramName = "id") => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName} format`),
  validate,
];

/**
 * Validation rules for pagination query params
 */
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  validate,
];

/**
 * Validation rules for email param
 */
const validateEmail = [
  param("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  validate,
];

module.exports = {
  validate,
  validateCreateEvent,
  validateUpdateEvent,
  validatePurchaseTicket,
  validateVerifyTicket,
  validateObjectId,
  validatePagination,
  validateEmail,
};
