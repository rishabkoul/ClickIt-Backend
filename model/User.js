const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    max: 255,
    min: 5,
    required: true,
  },
  phone: {
    type: Number,
    max: 9999999999,
    min: 1000000000,
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);
