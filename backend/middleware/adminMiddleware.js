/**
 * Admin Authorization Middleware
 * Checks if authenticated user has admin role
 * Must be used AFTER authenticate middleware
 */

const isAdmin = (req, res, next) => {
  try {
    // Check if user is attached to request (from authenticate middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check if user has admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // User is admin, proceed
    next();
  } catch (error) {
    console.error("Admin authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
      error: error.message,
    });
  }
};

/**
 * Check if user is admin OR the resource owner
 * Useful for endpoints where users can access their own data or admins can access anyone's
 */
const isAdminOrOwner = (resourceUserIdParam = "userId") => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Admin can access anything
      if (req.user.role === "admin") {
        return next();
      }

      // Check if user is accessing their own resource
      const resourceUserId =
        req.params[resourceUserIdParam] || req.body[resourceUserIdParam];

      if (resourceUserId && resourceUserId === req.user.id) {
        return next();
      }

      // Not admin and not owner
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own resources.",
      });
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
        error: error.message,
      });
    }
  };
};

/**
 * Check if user is an organizer (or admin)
 * Organizers and admins can pass this check
 */
const isOrganizer = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Admin always has access
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user is organizer
    if (req.user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Organizer privileges required.",
      });
    }

    // User is organizer, proceed
    next();
  } catch (error) {
    console.error("Organizer authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
      error: error.message,
    });
  }
};

/**
 * Check if user is an APPROVED organizer (or admin)
 * Requires organizer to have approved status
 */
const isApprovedOrganizer = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Admin always has access
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user is organizer
    if (req.user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Organizer privileges required.",
      });
    }

    // Check if organizer is approved
    if (req.user.organizerProfile?.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Your organizer account is pending approval.",
      });
    }

    // User is approved organizer proceed
    next();
  } catch (error) {
    console.error("Organizer authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
      error: error.message,
    });
  }
};

/**
 * Check if user owns the event (or is admin)
 * Requires the event to be loaded into req.event first
 */
const isEventOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Admin can access any event
    if (req.user.role === "admin") {
      return next();
    }

    // Load event if not already loaded
    if (!req.event) {
      const { Event } = require("../models");
      const eventId = req.params.id || req.params.eventId;
      
      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: "Event ID is required",
        });
      }

      req.event = await Event.findById(eventId);
      
      if (!req.event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }
    }

    // Check if user owns the event
    if (req.event.organizerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only manage your own events.",
      });
    }

    // User owns the event, proceed
    next();
  } catch (error) {
    console.error("Event ownership authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
      error: error.message,
    });
  }
};

/**
 * Check if user is admin OR event owner
 * Combines admin check with event ownership
 */
const isAdminOrEventOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Admin can access anything
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user is organizer
    if (req.user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Organizer or admin privileges required.",
      });
    }

    // Check if organizer is approved
    if (req.user.organizerProfile?.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Your organizer account is pending approval.",
      });
    }

    // Load event if not already loaded
    if (!req.event) {
      const { Event } = require("../models");
      const eventId = req.params.id || req.params.eventId || req.body.eventId;
      
      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: "Event ID is required",
        });
      }

      req.event = await Event.findById(eventId);
      
      if (!req.event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }
    }

    // Check if user owns the event
    if (req.event.organizerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only manage your own events.",
      });
    }

    // User owns the event, proceed
    next();
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
      error: error.message,
    });
  }
};

module.exports = {
  isAdmin,
  isAdminOrOwner,
  isOrganizer,
  isApprovedOrganizer,
  isEventOwner,
  isAdminOrEventOwner,
};
