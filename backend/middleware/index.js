const errorHandler = require("./errorHandler");
const { authenticate, optionalAuth } = require("./authMiddleware");
const { isAdmin, isAdminOrOwner } = require("./adminMiddleware");
const {
  validateCreateEvent,
  validateUpdateEvent,
  validatePurchaseTicket,
  validateVerifyTicket,
  validateObjectId,
  validatePagination,
  validateEmail,
} = require("./validateRequest");

module.exports = {
  errorHandler,
  authenticate,
  optionalAuth,
  isAdmin,
  isAdminOrOwner,
  validateCreateEvent,
  validateUpdateEvent,
  validatePurchaseTicket,
  validateVerifyTicket,
  validateObjectId,
  validatePagination,
  validateEmail,
};
