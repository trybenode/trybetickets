const express = require("express");
const { connectMongoDB } = require("./config/mongo");

const app = express();

// Middleware
app.use(express.json());

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Hello from TrybeTickets backend!");
});


const startServer = async () => {
  try {
    // connect to MongoDB first
    await connectMongoDB();

    // start server
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();