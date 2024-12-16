require("dotenv").config();
// Import Routes
const chatRoutes = require("./routes/chatRoutes");
const errorHandler = require("./middleware/errorHandler");
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./utils/db");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

// MongoDB Connection
connectDB();

app.use("/api", chatRoutes);
// Log when a client connects
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Log "join" event
  socket.on("join", (username) => {
    console.log(`${username} joined the chat`);
    socket.broadcast.emit("user-joined", { username });
  });

  // Log "message" event
  socket.on("message", (data) => {
    console.log("Message received:", data);
    io.emit("new-message", data); // Broadcast the message to all clients
  });

  // Log when a client disconnects
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
// Error handling middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export io for socket handling
module.exports = io;
