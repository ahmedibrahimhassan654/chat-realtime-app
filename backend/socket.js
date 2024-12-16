const User = require("./models/User");
const Message = require("./models/Message");

const handleSocketEvents = (io) => {
  io.on("connection", async (socket) => {
    console.log("New client connected:", socket.id);

    // Restore username on reconnection
    socket.on("restore-session", async (username) => {
      console.log(`${username} restored session.`);
      socket.username = username;

      // Update user as connected
      await User.findOneAndUpdate(
        { username },
        { connectedAt: new Date(), disconnectedAt: null },
        { new: true }
      );

      // Emit updated active users list
      await emitActiveUsers(io);

      // Send previous chat history to the client
      const messages = await Message.find()
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();
      socket.emit("previous-messages", messages.reverse());
    });

    // Handle user joining
    socket.on("join", async (username) => {
      console.log(`${username} joined the chat`);

      let user = await User.findOne({ username });
      if (!user) {
        user = new User({ username });
        await user.save();
      } else {
        user.connectedAt = new Date();
        user.disconnectedAt = null;
        await user.save();
      }

      socket.username = username;

      // Emit updated active users list
      await emitActiveUsers(io);

      // Send chat history to the user
      const messages = await Message.find()
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();
      socket.emit("previous-messages", messages.reverse());

      // Notify others
      socket.broadcast.emit("user-joined", { username });
    });

    // Handle sending a message
    socket.on("message", async (data) => {
      console.log("Message received:", data);

      const newMessage = new Message({
        sender: data.sender,
        text: data.text,
        timestamp: new Date(),
      });

      try {
        await newMessage.save();
        io.emit("new-message", { sender: data.sender, text: data.text });
      } catch (error) {
        console.error("Error saving message to DB:", error);
      }
    });

    // Handle user leaving
    socket.on("leave", async () => {
      if (socket.username) {
        console.log(`${socket.username} left the chat`);

        const user = await User.findOne({ username: socket.username });
        if (user) {
          user.disconnectedAt = new Date();
          await user.save();
        }

        // Emit updated active users list
        await emitActiveUsers(io);
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

          // Emit updated active users list
          await emitActiveUsers(io);
          io.emit("user-left", { username: socket.username });
        }
      }
    });
  });
};

// Helper function to emit the updated active users list
const emitActiveUsers = async (io) => {
  const activeUsers = await User.find({ disconnectedAt: null }).select(
    "username -_id"
  );
  io.emit(
    "active-users",
    activeUsers.map((u) => u.username)
  );
};

module.exports = handleSocketEvents;
