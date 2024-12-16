const Message = require("../models/Message");

exports.getChatHistory = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("sender", "username") // Populate the sender's username
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(messages.reverse()); // Return messages in ascending order
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Server Error");
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Server Error");
  }
};
