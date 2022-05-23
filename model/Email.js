const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    max: 255,
    min: 5,
    required: true,
  },
  emailOtp: {
    type: Number,
    max: 9999,
    min: 1000,
    required: true,
  },
});

module.exports = mongoose.model("Email", emailSchema);
