const express = require("express");
const router = express.Router();

// Import route modules
const eventRoutes = require("./eventRoutes");
const ticketRoutes = require("./ticketRoutes");
const verificationRoutes = require("./verificationRoutes");
const userRoutes = require("./userRoutes");
const organizerRoutes = require("./organizerRoutes");
const reviewRoutes = require("./reviewRoutes");
const paymentRoutes = require("./paymentRoutes");

// Mount routes
router.use("/events", eventRoutes);
router.use("/tickets", ticketRoutes);
router.use("/verify", verificationRoutes);
router.use("/users", userRoutes);
router.use("/organizers", organizerRoutes);
router.use("/payments", paymentRoutes);
router.use("/", reviewRoutes); // Review routes include event-specific paths

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TrybeTickets API is running",
    timestamp: new Date().toISOString(),
  });
});

// API documentation endpoint
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to TrybeTickets API",
    version: "1.0.0",
    endpoints: {
      events: "/api/events",
      tickets: "/api/tickets",
      verification: "/api/verify",
      users: "/api/users",
      organizers: "/api/organizers",
      reviews: "/api/events/:eventId/reviews",
      payments: "/api/payments",
      health: "/api/health",
    },
  });
});

module.exports = router;
