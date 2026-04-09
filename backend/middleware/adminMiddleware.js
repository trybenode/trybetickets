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

module.exports = {
  isAdmin,
  isAdminOrOwner,
};
