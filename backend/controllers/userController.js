const { User, Ticket } = require("../models");
const mongoose = require("mongoose");

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private (User must be authenticated)
 */
const getUserProfile = async (req, res) => {
  try {
    // Assuming req.user is set by auth middleware
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findById(userId).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fields that can be updated
    const allowedUpdates = ["name", "phone", "bio", "avatar"];
    const updates = Object.keys(req.body);

    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: "Invalid updates. You can only update: name, phone, bio, avatar",
      });
    }

    // Apply updates
    updates.forEach((update) => {
      user[update] = req.body[update];
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's tickets (purchase history)
 * @route   GET /api/users/tickets
 * @access  Private
 */
const getUserTickets = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get all tickets for this user (including guest purchases with same email)
    const tickets = await user.getTickets();

    // Separate into upcoming and past
    const now = new Date();
    const upcoming = tickets.filter(
      (ticket) => ticket.eventId && new Date(ticket.eventId.date) >= now
    );
    const past = tickets.filter(
      (ticket) => ticket.eventId && new Date(ticket.eventId.date) < now
    );

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: {
        all: tickets,
        upcoming,
        past,
      },
    });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

/**
 * @desc    Get specific user's tickets (Admin only)
 * @route   GET /api/users/:id/tickets
 * @access  Private/Admin
 */
const getUserTicketsByUserId = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get all tickets for this user (including guest purchases with same email)
    const tickets = await user.getTickets();

    // Separate into upcoming and past
    const now = new Date();
    const upcoming = tickets.filter(
      (ticket) => ticket.eventId && new Date(ticket.eventId.date) >= now
    );
    const past = tickets.filter(
      (ticket) => ticket.eventId && new Date(ticket.eventId.date) < now
    );

    res.status(200).json({
      success: true,
      count: tickets.length,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      data: {
        all: tickets,
        upcoming,
        past,
      },
    });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user tickets",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's upcoming events
 * @route   GET /api/users/events/upcoming
 * @access  Private
 */
const getUserUpcomingEvents = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const upcomingTickets = await user.getUpcomingEvents();

    res.status(200).json({
      success: true,
      count: upcomingTickets.length,
      data: upcomingTickets,
    });
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming events",
      error: error.message,
    });
  }
};

/**
 * @desc    Create or get user by Firebase UID
 * @route   POST /api/users/auth
 * @access  Public (Called after Firebase authentication)
 */
const createOrGetUserFromFirebase = async (req, res) => {
  try {
    const { firebaseUID, email, name, phoneNumber, photoURL, emailVerified, role } =
      req.body;

    if (!firebaseUID || !email) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and email are required",
      });
    }

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ firebaseUID }, { email }],
    });

    if (user) {
      // Update firebaseUID if not set (user may have been pre-created)
      if (!user.firebaseUID) {
        user.firebaseUID = firebaseUID;
        await user.save();
      }
      
      // Update last login
      await user.updateLastLogin();
      
      return res.status(200).json({
        success: true,
        message: "User logged in",
        data: user,
      });
    }

    // Create new user
    user = await User.create({
      firebaseUID,
      email,
      name: name || email.split('@')[0],
      phone: phoneNumber || null,
      isEmailVerified: emailVerified || false,
      avatar: photoURL || null,
      role: role || 'user', // Default to 'user', can be 'organizer'
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error creating/getting user from Firebase:", error);
    res.status(500).json({
      success: false,
      message: "Failed to authenticate user",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user by ID (Admin only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const user = await User.findById(id).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's ticket statistics
    const ticketCount = await Ticket.countDocuments({
      $or: [{ userId: id }, { buyerEmail: user.email }],
    });

    const usedTickets = await Ticket.countDocuments({
      $or: [{ userId: id }, { buyerEmail: user.email }],
      status: "used",
    });

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          totalTickets: ticketCount,
          ticketsUsed: usedTickets,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required (user or admin)",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/:id
 * @access  Private/Admin or User themselves
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Soft delete - mark as deleted instead of removing
    user.status = "deleted";
    await user.save();

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserTickets,
  getUserTicketsByUserId,
  getUserUpcomingEvents,
  createOrGetUserFromFirebase,
  getUserById,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
