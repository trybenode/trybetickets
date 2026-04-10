const { Event, Ticket } = require("../models");
const mongoose = require("mongoose");

/**
 * @desc    Get all active events
 * @route   GET /api/events
 * @access  Public
 */
const getAllEvents = async (req, res) => {
  try {
    const { status, upcoming, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      // Default to active events only
      query.status = "active";
    }

    // Filter upcoming events
    if (upcoming === "true") {
      query.date = { $gte: new Date() };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const events = await Event.find(query)
      .populate("organizerId", "email organizerProfile.companyName")
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single event by ID
 * @route   GET /api/events/:id
 * @access  Public
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.findById(id).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Get ticket statistics for this event
    const ticketStats = await Ticket.aggregate([
      { $match: { eventId: mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      sold: event.ticketsSold,
      available: event.totalTickets - event.ticketsSold,
      checked_in:
        ticketStats.find((s) => s._id === "used")?.count || 0,
    };

    res.status(200).json({
      success: true,
      data: {
        ...event,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new event
 * @route   POST /api/events
 * @access  Private/Admin or Approved Organizer
 */
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      venue,
      ticketPrice,
      totalTickets,
      organizerName,
      organizerContact,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !date ||
      !venue ||
      ticketPrice === undefined ||
      !totalTickets ||
      !organizerName
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate date is in the future
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date must be in the future",
      });
    }

    // Create event with organizerId set to current user
    const event = await Event.create({
      title,
      description,
      date: eventDate,
      venue,
      ticketPrice,
      totalTickets,
      organizerName,
      organizerContact,
      organizerId: req.user.id, // Auto-set from authenticated user
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error creating event:", error);

    // Handle validation errors
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
      message: "Failed to create event",
      error: error.message,
    });
  }
};

/**
 * @desc    Update event
 * @route   PUT /api/events/:id
 * @access  Private/Admin
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      "title",
      "description",
      "date",
      "venue",
      "ticketPrice",
      "totalTickets",
      "status",
      "organizerName",
      "organizerContact",
    ];

    // Validate updates
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: "Invalid updates",
      });
    }

    // Check if trying to reduce total tickets below sold count
    if (req.body.totalTickets && req.body.totalTickets < event.ticketsSold) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce total tickets below ${event.ticketsSold} (already sold)`,
      });
    }

    // Validate date if updating
    if (req.body.date) {
      const newDate = new Date(req.body.date);
      if (newDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Event date must be in the future",
        });
      }
      req.body.date = newDate;
    }

    // Apply updates
    updates.forEach((update) => {
      event[update] = req.body[update];
    });

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error updating event:", error);

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
      message: "Failed to update event",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete event (soft delete - set status to cancelled)
 * @route   DELETE /api/events/:id
 * @access  Private/Admin
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if tickets have been sold
    if (event.ticketsSold > 0) {
      // Soft delete - change status to cancelled instead of removing
      event.status = "cancelled";
      await event.save();

      return res.status(200).json({
        success: true,
        message: "Event cancelled (tickets were sold)",
        data: event,
      });
    }

    // Hard delete if no tickets sold
    await Event.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message,
    });
  }
};

/**
 * @desc    Get event analytics/statistics
 * @route   GET /api/events/:id/analytics
 * @access  Private/Admin or Event Owner
 */
const getEventAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Get detailed ticket statistics
    const ticketStats = await Ticket.aggregate([
      { $match: { eventId: mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$amountPaid" },
        },
      },
    ]);

    // Get total revenue
    const totalRevenue = ticketStats.reduce(
      (sum, stat) => sum + (stat.totalRevenue || 0),
      0
    );

    // Get recent ticket purchases
    const recentPurchases = await Ticket.find({ eventId: id })
      .sort({ purchaseDate: -1 })
      .limit(10)
      .select("buyerName buyerEmail purchaseDate amountPaid status")
      .lean();

    const analytics = {
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        status: event.status,
      },
      tickets: {
        total: event.totalTickets,
        sold: event.ticketsSold,
        available: event.totalTickets - event.ticketsSold,
        valid: ticketStats.find((s) => s._id === "valid")?.count || 0,
        used: ticketStats.find((s) => s._id === "used")?.count || 0,
        cancelled: ticketStats.find((s) => s._id === "cancelled")?.count || 0,
      },
      revenue: {
        total: totalRevenue,
        expected: event.ticketsSold * event.ticketPrice,
        perTicket: event.ticketPrice,
      },
      attendance: {
        checkedIn: ticketStats.find((s) => s._id === "used")?.count || 0,
        notCheckedIn: ticketStats.find((s) => s._id === "valid")?.count || 0,
        checkInRate:
          event.ticketsSold > 0
            ? (
                ((ticketStats.find((s) => s._id === "used")?.count || 0) /
                  event.ticketsSold) *
                100
              ).toFixed(2)
            : 0,
      },
      recentPurchases,
    };

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching event analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event analytics",
      error: error.message,
    });
  }
};

/**
 * @desc    Get organizer's own events
 * @route   GET /api/events/my-events
 * @access  Private/Approved Organizer
 */
const getMyEvents = async (req, res) => {
  try {
    const { status, upcoming, page = 1, limit = 10 } = req.query;

    // Build query - filter by current user's organizerId
    const query = { organizerId: req.user.id };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter upcoming events
    if (upcoming === "true") {
      query.date = { $gte: new Date() };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const events = await Event.find(query)
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    // Get aggregate stats for organizer's events
    const stats = await Event.aggregate([
      { $match: { organizerId: mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalTicketsSold: { $sum: "$ticketsSold" },
          totalRevenue: { $sum: { $multiply: ["$ticketsSold", "$ticketPrice"] } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      stats: stats,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching my events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your events",
      error: error.message,
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAnalytics,
  getMyEvents,
};
