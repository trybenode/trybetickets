const { Ticket } = require("../models");
const mongoose = require("mongoose");

/**
 * @desc    Verify ticket by QR token (check-in)
 * @route   POST /api/verify
 * @access  Private/Admin (Scanner)
 */
const verifyTicket = async (req, res) => {
  try {
    const { qrToken, checkedInBy } = req.body;

    if (!qrToken) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "QR token is required",
      });
    }

    // Find ticket by QR token and populate event
    const ticket = await Ticket.findOne({ qrToken }).populate("eventId");

    // Ticket not found
    if (!ticket) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Invalid ticket - not found in system",
      });
    }

    // Check if ticket is cancelled
    if (ticket.status === "cancelled") {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "This ticket has been cancelled",
        ticket: {
          id: ticket._id,
          eventName: ticket.eventId.title,
          buyerName: ticket.buyerName,
          status: ticket.status,
        },
      });
    }

    // Check if ticket is already used
    if (ticket.status === "used") {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Ticket already used",
        ticket: {
          id: ticket._id,
          eventName: ticket.eventId.title,
          buyerName: ticket.buyerName,
          status: ticket.status,
          checkedInAt: ticket.checkedInAt,
          checkedInBy: ticket.checkedInBy,
        },
      });
    }

    // Check if event date has passed (optional - depends on your business rules)
    const eventDate = new Date(ticket.eventId.date);
    const now = new Date();
    const oneDayAfterEvent = new Date(eventDate);
    oneDayAfterEvent.setDate(oneDayAfterEvent.getDate() + 1);

    if (now > oneDayAfterEvent) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Event has ended. Check-in period expired.",
        ticket: {
          id: ticket._id,
          eventName: ticket.eventId.title,
          buyerName: ticket.buyerName,
          eventDate: ticket.eventId.date,
        },
      });
    }

    // Ticket is valid - mark as used
    ticket.status = "used";
    ticket.checkedInAt = new Date();
    ticket.checkedInBy = checkedInBy || "Scanner";
    await ticket.save();

    // Return success response with ticket details
    res.status(200).json({
      success: true,
      valid: true,
      message: "✅ Valid ticket - Entry granted",
      ticket: {
        id: ticket._id,
        eventName: ticket.eventId.title,
        eventDate: ticket.eventId.date,
        eventVenue: ticket.eventId.venue,
        buyerName: ticket.buyerName,
        buyerEmail: ticket.buyerEmail,
        purchaseDate: ticket.purchaseDate,
        checkedInAt: ticket.checkedInAt,
        amountPaid: ticket.amountPaid,
      },
    });
  } catch (error) {
    console.error("Error verifying ticket:", error);
    res.status(500).json({
      success: false,
      valid: false,
      message: "Failed to verify ticket",
      error: error.message,
    });
  }
};

/**
 * @desc    Check ticket status without marking as used
 * @route   GET /api/verify/check/:qrToken
 * @access  Public (for preview before scanning)
 */
const checkTicketStatus = async (req, res) => {
  try {
    const { qrToken } = req.params;

    if (!qrToken) {
      return res.status(400).json({
        success: false,
        message: "QR token is required",
      });
    }

    const ticket = await Ticket.findOne({ qrToken }).populate(
      "eventId",
      "title date venue status"
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Ticket not found",
      });
    }

    // Return status without modifying ticket
    const response = {
      success: true,
      ticket: {
        id: ticket._id,
        status: ticket.status,
        eventName: ticket.eventId.title,
        eventDate: ticket.eventId.date,
        eventVenue: ticket.eventId.venue,
        eventStatus: ticket.eventId.status,
        buyerName: ticket.buyerName,
        purchaseDate: ticket.purchaseDate,
      },
    };

    // Add check-in details if already used
    if (ticket.status === "used") {
      response.ticket.checkedInAt = ticket.checkedInAt;
      response.ticket.checkedInBy = ticket.checkedInBy;
    }

    // Determine if ticket is currently valid
    response.valid =
      ticket.status === "valid" &&
      ticket.eventId.status === "active" &&
      new Date(ticket.eventId.date) > new Date();

    res.status(200).json(response);
  } catch (error) {
    console.error("Error checking ticket status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check ticket status",
      error: error.message,
    });
  }
};

/**
 * @desc    Manually mark ticket as used (admin override)
 * @route   PATCH /api/verify/checkin/:ticketId
 * @access  Private/Admin
 */
const manualCheckIn = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { checkedInBy } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID format",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot check in a cancelled ticket",
      });
    }

    if (ticket.status === "used") {
      return res.status(400).json({
        success: false,
        message: "Ticket already checked in",
        checkedInAt: ticket.checkedInAt,
      });
    }

    // Mark as used
    ticket.status = "used";
    ticket.checkedInAt = new Date();
    ticket.checkedInBy = checkedInBy || "Manual Entry";
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket checked in successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Error during manual check-in:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check in ticket",
      error: error.message,
    });
  }
};

/**
 * @desc    Get verification statistics for an event
 * @route   GET /api/verify/stats/:eventId
 * @access  Private/Admin
 */
const getVerificationStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const stats = await Ticket.aggregate([
      { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalTickets = stats.reduce((sum, s) => sum + s.count, 0);
    const checkedIn = stats.find((s) => s._id === "used")?.count || 0;
    const pending = stats.find((s) => s._id === "valid")?.count || 0;
    const cancelled = stats.find((s) => s._id === "cancelled")?.count || 0;

    // Get recent check-ins
    const recentCheckIns = await Ticket.find({
      eventId,
      status: "used",
    })
      .sort({ checkedInAt: -1 })
      .limit(10)
      .select("buyerName checkedInAt checkedInBy")
      .lean();

    res.status(200).json({
      success: true,
      data: {
        total: totalTickets,
        checkedIn,
        pending,
        cancelled,
        checkInRate:
          totalTickets > 0
            ? ((checkedIn / totalTickets) * 100).toFixed(2) + "%"
            : "0%",
        recentCheckIns,
      },
    });
  } catch (error) {
    console.error("Error fetching verification stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch verification statistics",
      error: error.message,
    });
  }
};

module.exports = {
  verifyTicket,
  checkTicketStatus,
  manualCheckIn,
  getVerificationStats,
};
