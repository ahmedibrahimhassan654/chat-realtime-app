const express = require("express");
const chatRoutes = require("./routes/chatRoutes");
const errorHandler = require("./middleware/errorHandler");
const connectDB = require("./utils/db");

// Initialize express app
const app = express();
app.use(express.json());

// MongoDB connection
connectDB();

// Routes
app.use("/api", chatRoutes);
app.use("/", (req, res) => res.send("hello"));

// Error handling middleware
app.use(errorHandler);

module.exports = app;
