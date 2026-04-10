const { User, Event, Ticket } = require("../models");
const mongoose = require("mongoose");

/**
 * @desc    Register as an organizer (user applies to become organizer)
 * @route   POST /api/organizers/register
 * @access  Private (authenticated users only)
 */
const registerAsOrganizer = async (req, res) => {
  try {
    const { companyName, description, website, logo } = req.body;

    // Validate required fields
    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    // Check if user is already an organizer
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "organizer") {
      return res.status(400).json({
        success: false,
        message: "You are already an organizer",
        currentStatus: user.organizerProfile?.status,
      });
    }

    // Promote user to organizer with pending status
    const updatedUser = await User.promoteToOrganizer(req.user.id, {
      companyName,
      description,
      website,
      logo,
    });

    res.status(200).json({
      success: true,
      message: "Application submitted! Your organizer account is pending approval.",
      data: {
        id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        organizerProfile: updatedUser.organizerProfile,
      },
    });
  } catch (error) {
    console.error("Error registering as organizer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register as organizer",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all organizers (with optional status filter)
 * @route   GET /api/organizers
 * @access  Private/Admin
 */
const getAllOrganizers = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { role: "organizer" };
    if (status) {
      query["organizerProfile.status"] = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const organizers = await User.find(query)
      .select("-__v")
      .sort({ "organizerProfile.createdAt": -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    // Get event counts for each organizer
    const organizersWithStats = await Promise.all(
      organizers.map(async (organizer) => {
        const eventCount = await Event.countDocuments({
          organizerId: organizer._id,
        });
        const activeEventCount = await Event.countDocuments({
          organizerId: organizer._id,
          status: "active",
        });
        return {
          ...organizer,
          stats: {
            totalEvents: eventCount,
            activeEvents: activeEventCount,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: organizers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: organizersWithStats,
    });
  } catch (error) {
    console.error("Error fetching organizers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch organizers",
      error: error.message,
    });
  }
};

/**
 * @desc    Get pending organizer applications
 * @route   GET /api/organizers/pending
 * @access  Private/Admin
 */
const getPendingOrganizers = async (req, res) => {
  try {
    const pendingOrganizers = await User.findPendingOrganizers();

    res.status(200).json({
      success: true,
      count: pendingOrganizers.length,
      data: pendingOrganizers,
    });
  } catch (error) {
    console.error("Error fetching pending organizers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending organizers",
      error: error.message,
    });
  }
};

/**
 * @desc    Approve organizer application
 * @route   PUT /api/organizers/:id/approve
 * @access  Private/Admin
 */
const approveOrganizer = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer ID format",
      });
    }

    const organizer = await User.findById(id);

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    if (organizer.role !== "organizer") {
      return res.status(400).json({
        success: false,
        message: "User is not an organizer",
      });
    }

    if (organizer.organizerProfile?.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Organizer is already approved",
      });
    }

    // Approve the organizer
    const approvedOrganizer = await User.approveOrganizer(id, req.user.id);

    res.status(200).json({
      success: true,
      message: "Organizer approved successfully",
      data: {
        id: approvedOrganizer._id,
        email: approvedOrganizer.email,
        organizerProfile: approvedOrganizer.organizerProfile,
      },
    });
  } catch (error) {
    console.error("Error approving organizer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve organizer",
      error: error.message,
    });
  }
};

/**
 * @desc    Suspend organizer account
 * @route   PUT /api/organizers/:id/suspend
 * @access  Private/Admin
 */
const suspendOrganizer = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer ID format",
      });
    }

    const organizer = await User.findById(id);

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    if (organizer.role !== "organizer") {
      return res.status(400).json({
        success: false,
        message: "User is not an organizer",
      });
    }

    if (organizer.organizerProfile?.status === "suspended") {
      return res.status(400).json({
        success: false,
        message: "Organizer is already suspended",
      });
    }

    // Suspend the organizer
    const suspendedOrganizer = await User.suspendOrganizer(id);

    // Optionally: Cancel all their active events
    // await Event.updateMany(
    //   { organizerId: id, status: 'active' },
    //   { $set: { status: 'cancelled' } }
    // );

    res.status(200).json({
      success: true,
      message: "Organizer suspended successfully",
      data: {
        id: suspendedOrganizer._id,
        email: suspendedOrganizer.email,
        organizerProfile: suspendedOrganizer.organizerProfile,
      },
    });
  } catch (error) {
    console.error("Error suspending organizer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to suspend organizer",
      error: error.message,
    });
  }
};

/**
 * @desc    Get organizer dashboard (own profile + stats)
 * @route   GET /api/organizers/dashboard
 * @access  Private/Approved Organizer
 */
const getOrganizerDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get event statistics
    const totalEvents = await Event.countDocuments({ organizerId: req.user.id });
    const activeEvents = await Event.countDocuments({
      organizerId: req.user.id,
      status: "active",
    });
    const completedEvents = await Event.countDocuments({
      organizerId: req.user.id,
      status: "completed",
    });
    const cancelledEvents = await Event.countDocuments({
      organizerId: req.user.id,
      status: "cancelled",
    });

    // Get ticket sales statistics
    const eventIds = await Event.find({ organizerId: req.user.id }).distinct("_id");
    
    const ticketStats = await Ticket.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$amountPaid" },
        },
      },
    ]);

    const totalTicketsSold = ticketStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalRevenue = ticketStats.reduce(
      (sum, stat) => sum + (stat.totalRevenue || 0),
      0
    );
    const checkedInTickets = ticketStats.find((s) => s._id === "used")?.count || 0;

    // Get recent events
    const recentEvents = await Event.find({ organizerId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title date status ticketsSold totalTickets ticketPrice")
      .lean();

    const dashboard = {
      profile: {
        id: user._id,
        email: user.email,
        role: user.role,
        organizerProfile: user.organizerProfile,
      },
      stats: {
        events: {
          total: totalEvents,
          active: activeEvents,
          completed: completedEvents,
          cancelled: cancelledEvents,
        },
        tickets: {
          totalSold: totalTicketsSold,
          checkedIn: checkedInTickets,
          checkInRate:
            totalTicketsSold > 0
              ? ((checkedInTickets / totalTicketsSold) * 100).toFixed(2) + "%"
              : "0%",
        },
        revenue: {
          total: totalRevenue,
          currency: "USD", // You can make this configurable
        },
      },
      recentEvents,
    };

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Error fetching organizer dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard",
      error: error.message,
    });
  }
};

/**
 * @desc    Update organizer profile
 * @route   PUT /api/organizers/profile
 * @access  Private/Organizer
 */
const updateOrganizerProfile = async (req, res) => {
  try {
    const { companyName, description, website, logo } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        message: "User is not an organizer",
      });
    }

    // Update allowed fields
    if (companyName) user.organizerProfile.companyName = companyName;
    if (description !== undefined) user.organizerProfile.description = description;
    if (website !== undefined) user.organizerProfile.website = website;
    if (logo !== undefined) user.organizerProfile.logo = logo;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        email: user.email,
        organizerProfile: user.organizerProfile,
      },
    });
  } catch (error) {
    console.error("Error updating organizer profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

module.exports = {
  registerAsOrganizer,
  getAllOrganizers,
  getPendingOrganizers,
  approveOrganizer,
  suspendOrganizer,
  getOrganizerDashboard,
  updateOrganizerProfile,
};
