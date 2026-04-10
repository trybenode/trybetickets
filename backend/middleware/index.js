const errorHandler = require("./errorHandler");
const { authenticate, optionalAuth } = require("./authMiddleware");
const { 
  isAdmin, 
  isAdminOrOwner,
  isOrganizer,
  isApprovedOrganizer,
  isEventOwner,
  isAdminOrEventOwner
} = require("./adminMiddleware");
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
  isOrganizer,
  isApprovedOrganizer,
  isEventOwner,
  isAdminOrEventOwner,
  validateCreateEvent,
  validateUpdateEvent,
  validatePurchaseTicket,
  validateVerifyTicket,
  validateObjectId,
  validatePagination,
  validateEmail,
};
