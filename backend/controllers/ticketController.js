const { Event, Ticket, User } = require("../models");
const mongoose = require("mongoose");

/**
 * @desc    Purchase ticket (with concurrency control)
 * @route   POST /api/tickets/purchase
 * @access  Public
 */
const purchaseTicket = async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId, buyerName, buyerEmail, buyerPhone, userId } = req.body;

    // Validate required fields
    if (!eventId || !buyerName || !buyerEmail || !buyerPhone) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (eventId, buyerName, buyerEmail, buyerPhone)",
      });
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(buyerEmail)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Find event and lock it (use session for transaction)
    const event = await Event.findById(eventId).session(session);

    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if event is active
    if (event.status !== "active") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Event is ${event.status}. Cannot purchase tickets.`,
      });
    }

    // Check if event date has passed
    if (event.date < new Date()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Event has already passed. Cannot purchase tickets.",
      });
    }

    // CRITICAL: Check ticket availability (prevent overselling)
    if (event.ticketsSold >= event.totalTickets) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Sorry, this event is sold out",
      });
    }

    // Atomically increment tickets sold
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        ticketsSold: { $lt: event.totalTickets }, // Double-check availability
      },
      {
        $inc: { ticketsSold: 1 },
      },
      {
        new: true,
        session,
      }
    );

    if (!updatedEvent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Failed to reserve ticket. Event may be sold out.",
      });
    }

    // Validate userId if provided
    let userObjectId = null;
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }
      userObjectId = userId;
    }

    // Create ticket
    const ticket = await Ticket.create(
      [
        {
          eventId,
          userId: userObjectId,
          buyerName,
          buyerEmail,
          buyerPhone,
          amountPaid: event.ticketPrice,
          status: "valid",
        },
      ],
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Populate event details for response
    const populatedTicket = await Ticket.findById(ticket[0]._id).populate(
      "eventId",
      "title date venue ticketPrice"
    );

    res.status(201).json({
      success: true,
      message: "Ticket purchased successfully",
      data: populatedTicket,
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error("Error purchasing ticket:", error);

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
      message: "Failed to purchase ticket",
      error: error.message,
    });
  }
};

/**
 * @desc    Get ticket by ID
 * @route   GET /api/tickets/:id
 * @access  Public (ticket holder can view their ticket)
 */
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID format",
      });
    }

    const ticket = await Ticket.findById(id).populate(
      "eventId",
      "title date venue ticketPrice"
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket",
      error: error.message,
    });
  }
};

/**
 * @desc    Get ticket by QR token (for quick lookup without login)
 * @route   GET /api/tickets/qr/:qrToken
 * @access  Public
 */
const getTicketByQRToken = async (req, res) => {
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
      "title date venue ticketPrice organizerName"
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error fetching ticket by QR token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket",
      error: error.message,
    });
  }
};

/**
 * @desc    Get tickets by email (for guests to view their tickets)
 * @route   GET /api/tickets/email/:email
 * @access  Public (but should verify email ownership in production)
 */
const getTicketsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const tickets = await Ticket.find({ buyerEmail: email.toLowerCase() })
      .populate("eventId", "title date venue ticketPrice status")
      .sort({ purchaseDate: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets by email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

/**
 * @desc    Cancel ticket
 * @route   PATCH /api/tickets/:id/cancel
 * @access  Private/Admin or Ticket Owner
 */
const cancelTicket = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID format",
      });
    }

    const ticket = await Ticket.findById(id).session(session);

    if (!ticket) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Check if ticket is already used
    if (ticket.status === "used") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a ticket that has already been used",
      });
    }

    // Check if ticket is already cancelled
    if (ticket.status === "cancelled") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Ticket is already cancelled",
      });
    }

    // Cancel ticket
    ticket.status = "cancelled";
    await ticket.save({ session });

    // Decrease tickets sold count atomically
    await Event.findByIdAndUpdate(
      ticket.eventId,
      {
        $inc: { ticketsSold: -1 },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Ticket cancelled successfully",
      data: ticket,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error cancelling ticket:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel ticket",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all tickets for an event
 * @route   GET /api/tickets/event/:eventId
 * @access  Private/Admin
 */
const getTicketsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, page = 1, limit = 50 } = req.query;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    // Build query
    const query = { eventId };
    if (status) {
      query.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tickets = await Ticket.find(query)
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching event tickets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

module.exports = {
  purchaseTicket,
  getTicketById,
  getTicketByQRToken,
  getTicketsByEmail,
  cancelTicket,
  getTicketsByEvent,
};
