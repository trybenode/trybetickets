require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectMongoDB } = require("./config/mongo");
const routes = require("./routes");
const { errorHandler } = require("./middleware");

const app = express();

// =========================================
// MIDDLEWARE
// =========================================

// CORS - Allow frontend to access API
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// =========================================
// ROUTES
// =========================================

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to TrybeTickets API",
    version: "1.0.0",
    docs: "/api",
  });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// =========================================
// ERROR HANDLER (must be last)
// =========================================
app.use(errorHandler);

// =========================================
// START SERVER
// =========================================
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectMongoDB();

    // Start server
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 API: http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();