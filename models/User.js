const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  connectedAt: { type: Date, default: Date.now },
  disconnectedAt: { type: Date },
});

module.exports = mongoose.model("User", UserSchema);
