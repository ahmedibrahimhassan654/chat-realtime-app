const io = require("../server");
const User = require("../models/User");
const Message = require("../models/Message");

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // User joins with username
  socket.on("join", async (username) => {
    socket.username = username;

    // Save user to DB
    await User.create({ username });

    // Notify all users
    io.emit("user-update", { username, status: "joined" });
  });

  // Handle message
  socket.on("message", async (message) => {
    const chatMessage = await Message.create({
      sender: socket.username,
      content: message,
    });

    // Broadcast to all users
    io.emit("new-message", chatMessage);
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    if (socket.username) {
      await User.findOneAndUpdate(
        { username: socket.username },
        { disconnectedAt: new Date() }
      );

      // Notify all users
      io.emit("user-update", { username: socket.username, status: "left" });
    }
    console.log("A user disconnected:", socket.id);
  });
});
