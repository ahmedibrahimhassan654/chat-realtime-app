const User = require("./models/User");
const Message = require("./models/Message");

const handleSocketEvents = (io) => {
  io.on("connection", async (socket) => {
    console.log("New client connected:", socket.id);

    // Handle user joining
    socket.on("join", async (username) => {
      console.log(`${username} joined the chat`);

      // Save the user in the database
      let user = await User.findOne({ username });
      if (!user) {
        user = new User({ username });
        await user.save();
      } else {
        // Update connectedAt timestamp if the user reconnects
        user.connectedAt = new Date();
        user.disconnectedAt = null; // Clear the disconnection time
        await user.save();
      }

      // Associate the socket ID with the user
      socket.username = username;

      // Broadcast the updated user list
      const activeUsers = await User.find({ disconnectedAt: null }).select(
        "username -_id"
      );
      io.emit(
        "active-users",
        activeUsers.map((u) => u.username)
      );

      // Send chat history to the user who just joined
      const messages = await Message.find()
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();
      socket.emit("previous-messages", messages.reverse());

      // Notify other users
      io.emit("user-joined", { username });
    });

    // Handle sending a message
    socket.on("message", async (data) => {
      console.log("Message received:", data);

      // Create and save the message
      const newMessage = new Message({
        sender: data.sender,
        text: data.text,
      });

      try {
        await newMessage.save();
        // Broadcast the message to all users
        io.emit("new-message", { sender: data.sender, text: data.text });
      } catch (error) {
        console.error("Error saving message to DB:", error);
      }
    });

    // Handle user leaving the chat
    socket.on("leave", async () => {
      if (socket.username) {
        console.log(`${socket.username} left the chat`);

        // Mark the user as disconnected
        const user = await User.findOne({ username: socket.username });
        if (user) {
          user.disconnectedAt = new Date();
          await user.save();
        }

        // Notify others and update active users list
        const activeUsers = await User.find({ disconnectedAt: null }).select(
          "username -_id"
        );
        io.emit(
          "active-users",
          activeUsers.map((u) => u.username)
        );
        io.emit("user-left", { username: socket.username });
      }
    });

    // Handle client disconnection
    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);

      if (socket.username) {
        const user = await User.findOne({ username: socket.username });
        if (user) {
          user.disconnectedAt = new Date();
          await user.save();

          // Notify others
          const activeUsers = await User.find({ disconnectedAt: null }).select(
            "username -_id"
          );
          io.emit(
            "active-users",
            activeUsers.map((u) => u.username)
          );
          io.emit("user-left", { username: socket.username });
        }
      }
    });
  });
};

module.exports = handleSocketEvents;
