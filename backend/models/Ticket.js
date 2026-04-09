const mongoose = require("mongoose");
const crypto = require("crypto");

const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event reference is required"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Null for guest purchases
      index: true,
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
    },
    buyerName: {
      type: String,
      required: [true, "Buyer name is required"],
      trim: true,
    },
    buyerEmail: {
      type: String,
      required: [true, "Buyer email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    buyerPhone: {
      type: String,
      required: [true, "Buyer phone is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["valid", "used", "cancelled"],
      default: "valid",
      index: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    checkedInBy: {
      type: String,
      default: null,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique QR token before saving
ticketSchema.pre("save", function (next) {
  if (!this.qrToken) {
    this.qrToken = crypto.randomBytes(16).toString("hex");
  }
  next();
});

// Compound index for efficient queries
ticketSchema.index({ eventId: 1, status: 1 });
ticketSchema.index({ userId: 1, status: 1 });
ticketSchema.index({ buyerEmail: 1 }); // For guest ticket lookup
ticketSchema.index({ qrToken: 1 }, { unique: true });

// Method to mark ticket as used
ticketSchema.methods.checkIn = function (checkedInBy = "Scanner") {
  if (this.status === "used") {
    throw new Error("Ticket has already been used");
  }
  if (this.status === "cancelled") {
    throw new Error("Ticket has been cancelled");
  }

  this.status = "used";
  this.checkedInAt = new Date();
  this.checkedInBy = checkedInBy;
  return this.save();
};

// Method to cancel ticket
ticketSchema.methods.cancel = function () {
  if (this.status === "used") {
    throw new Error("Cannot cancel a used ticket");
  }
  this.status = "cancelled";
  return this.save();
};

// Static method to verify ticket by QR token
ticketSchema.statics.verifyByQRToken = async function (qrToken) {
  const ticket = await this.findOne({ qrToken }).populate("eventId");

  if (!ticket) {
    return { valid: false, message: "Invalid ticket - not found" };
  }

  if (ticket.status === "used") {
    return {
      valid: false,
      message: "Ticket already used",
      ticket,
      checkedInAt: ticket.checkedInAt,
    };
  }

  if (ticket.status === "cancelled") {
    return { valid: false, message: "Ticket has been cancelled", ticket };
  }

  return { valid: true, message: "Valid ticket", ticket };
};

// Static method to get event statistics
ticketSchema.statics.getEventStats = async function (eventId) {
  const stats = await this.aggregate([
    { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    total: stats.reduce((sum, stat) => sum + stat.count, 0),
    valid: stats.find((s) => s._id === "valid")?.count || 0,
    used: stats.find((s) => s._id === "used")?.count || 0,
    cancelled: stats.find((s) => s._id === "cancelled")?.count || 0,
  };
};

module.exports = mongoose.model("Ticket", ticketSchema);
