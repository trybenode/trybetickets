const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Event date must be in the future",
      },
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organizer ID is required"],
      index: true,
    },
    ticketPrice: {
      type: Number,
      required: [true, "Ticket price is required"],
      min: [0, "Ticket price cannot be negative"],
    },
    totalTickets: {
      type: Number,
      required: [true, "Total tickets must be specified"],
      min: [1, "Must have at least 1 ticket available"],
    },
    ticketsSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "completed", "cancelled"],
      default: "active",
    },
    organizerName: {
      type: String,
      required: [true, "Organizer name is required"],
      trim: true,
    },
    organizerContact: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for available tickets
eventSchema.virtual("availableTickets").get(function () {
  return this.totalTickets - this.ticketsSold;
});

// Virtual for sold out status
eventSchema.virtual("isSoldOut").get(function () {
  return this.ticketsSold >= this.totalTickets;
});

// Indexes for performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizerId: 1, status: 1 });

// Virtual to populate organizer details
eventSchema.virtual("organizer", {
  ref: "User",
  localField: "organizerId",
  foreignField: "_id",
  justOne: true,
});

// Method to check if tickets are available
eventSchema.methods.hasAvailableTickets = function (quantity = 1) {
  return this.ticketsSold + quantity <= this.totalTickets;
};

// Method to check if user owns this event
eventSchema.methods.isOwnedBy = function (userId) {
  return this.organizerId.toString() === userId.toString();
};

// Method to check if user can manage this event
eventSchema.methods.canBeManagedBy = function (user) {
  if (user.role === "admin") return true;
  if (user.role !== "organizer") return false;
  if (user.organizerProfile?.status !== "approved") return false;
  return this.organizerId.toString() === user._id.toString();
};

// Static method to find active events
eventSchema.statics.findActiveEvents = function () {
  return this.find({ status: "active", date: { $gte: new Date() } }).sort({
    date: 1,
  });
};

// Static method to find events by organizer
eventSchema.statics.findByOrganizer = function (organizerId, includeInactive = false) {
  const query = { organizerId };
  if (!includeInactive) {
    query.status = "active";
  }
  return this.find(query).sort({ date: -1 });
};

// Ensure virtuals are included when converting to JSON
eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);
