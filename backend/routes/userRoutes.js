const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const {
  authenticate,
  isAdmin,
  isAdminOrOwner,
  validateObjectId,
  validatePagination,
} = require("../middleware");

/**
 * @route   POST /api/users/auth
 * @desc    Create or get user from Firebase authentication
 * @access  Public (called after Firebase login)
 */
router.post("/auth", userController.createOrGetUserFromFirebase);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get("/profile", authenticate, userController.getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put("/profile", authenticate, userController.updateUserProfile);

/**
 * @route   GET /api/users/tickets
 * @desc    Get current user's tickets (purchase history)
 * @access  Private
 */
router.get("/tickets", authenticate, userController.getUserTickets);

/**
 * @route   GET /api/users/events/upcoming
 * @desc    Get current user's upcoming events
 * @access  Private
 */
router.get("/events/upcoming", authenticate, userController.getUserUpcomingEvents);

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get("/", authenticate, isAdmin, validatePagination, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Admin only)
 * @access  Private/Admin
 */
router.get("/:id", authenticate, isAdmin, validateObjectId(), userController.getUserById);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private/Admin
 */
router.patch(
  "/:id/role",
  authenticate,
  isAdmin,
  validateObjectId(),
  userController.updateUserRole
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user account (Admin or owner)
 * @access  Private/Admin or User
 */
router.delete(
  "/:id",
  authenticate,
  isAdminOrOwner("id"),
  validateObjectId(),
  userController.deleteUser
);

module.exports = router;
