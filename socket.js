const User = require("./models/User");
const Message = require("./models/Message");

const activeUsers = new Map(); // In-memory map to track active users

const handleSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Restore username on reconnection
    socket.on("restore-session", (username) => {
      console.log(`${username} restored session.`);
      socket.username = username;

      // Add user to active users
      activeUsers.set(socket.id, username);

      // Emit updated active users list
      emitActiveUsers(io);
    });

    // Handle user joining
    socket.on("join", (username) => {
      console.log(`${username} joined the chat`);
      socket.username = username;

      // Add user to active users
      activeUsers.set(socket.id, username);

      // Emit updated active users list
      emitActiveUsers(io);

      // Notify others
      socket.broadcast.emit("user-joined", { username });
    });
    // Handle sending a message
    socket.on("message", async (data) => {
      if (!socket.username) {
        console.error("Message received from a socket without a username.");
        return;
      }

      console.log("Message received:", data);

      const newMessage = new Message({
        sender: socket.username, // Use socket.username for consistency
        text: data.text,
        timestamp: new Date(),
      });

      try {
        await newMessage.save();
        io.emit("new-message", {
          sender: socket.username, // Use socket.username
          text: data.text,
        });
      } catch (error) {
        console.error("Error saving message to DB:", error);
      }
    });
    // Handle user leaving
    socket.on("leave", () => {
      if (socket.username) {
        console.log(`${socket.username} left the chat`);

        // Remove user from active users
        activeUsers.delete(socket.id);

        // Emit updated active users list
        emitActiveUsers(io);
        io.emit("user-left", { username: socket.username });
      }
    });

    // Handle client disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      if (socket.username) {
        // Remove user from active users
        activeUsers.delete(socket.id);

        // Emit updated active users list
        emitActiveUsers(io);
        io.emit("user-left", { username: socket.username });
      }
    });
  });
};

// Helper function to emit the updated active users list
const emitActiveUsers = (io) => {
  const users = Array.from(activeUsers.values());
  io.emit("active-users", users);
};

module.exports = handleSocketEvents;
