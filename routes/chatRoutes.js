const express = require("express");
const {
  getChatHistory,
  getAllUsers,
} = require("../controllers/chatController");

const router = express.Router();
// Fetch last 50 messages
router.get("/messages", getChatHistory);
// Fetch all users
router.get("/users", getAllUsers);

module.exports = router;
