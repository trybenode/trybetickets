const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUID: {
      type: String,
      sparse: true, // Allows multiple null values (for guests)
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // Profile info (optional)
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    // Account status
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userSchema.index({ email: 1, role: 1 });
// Note: firebaseUID index auto-created by unique: true

// Instance method - Check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

// Instance method - Update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLoginAt = new Date();
  return this.save();
};

// Instance method - Get user's tickets
userSchema.methods.getTickets = async function () {
  const Ticket = mongoose.model("Ticket");
  return await Ticket.find({
    $or: [
      { userId: this._id },
      { buyerEmail: this.email }, // Match tickets bought as guest
    ],
  })
    .populate("eventId")
    .sort({ purchaseDate: -1 });
};

// Instance method - Get user's upcoming events
userSchema.methods.getUpcomingEvents = async function () {
  const Ticket = mongoose.model("Ticket");
  const tickets = await Ticket.find({
    $or: [{ userId: this._id }, { buyerEmail: this.email }],
    status: { $in: ["valid", "used"] },
  }).populate({
    path: "eventId",
    match: { date: { $gte: new Date() } },
  });

  return tickets.filter((ticket) => ticket.eventId !== null);
};

// Static method - Find or create user by email (for guest checkout to registered user)
userSchema.statics.findOrCreateByEmail = async function (email, name, phone) {
  let user = await this.findOne({ email });

  if (!user) {
    user = await this.create({
      email,
      name,
      phone,
    });
  }

  return user;
};

// Static method - Create user from Firebase auth
userSchema.statics.createFromFirebase = async function (firebaseUID, userData) {
  // Check if user already exists
  let user = await this.findOne({
    $or: [{ firebaseUID }, { email: userData.email }],
  });

  if (user) {
    // Update firebaseUID if user registered as guest first
    if (!user.firebaseUID) {
      user.firebaseUID = firebaseUID;
      await user.save();
    }
    return user;
  }

  // Create new user
  return await this.create({
    firebaseUID,
    email: userData.email,
    name: userData.name || userData.displayName || "User",
    phone: userData.phoneNumber || null,
    isEmailVerified: userData.emailVerified || false,
    avatar: userData.photoURL || null,
  });
};

// Static method - Get all admins
userSchema.statics.findAdmins = function () {
  return this.find({ role: "admin", status: "active" });
};

// Pre-save hook - Prevent email changes after verification
userSchema.pre("save", function (next) {
  if (this.isModified("email") && this.isEmailVerified && !this.isNew) {
    return next(new Error("Cannot change verified email address"));
  }
  next();
});

// Ensure sensitive data is not exposed in JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  // Remove sensitive fields if needed
  return user;
};

module.exports = mongoose.model("User", userSchema);
