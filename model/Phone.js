const mongoose = require("mongoose");

const phoneSchema = new mongoose.Schema({
  phone: {
    type: Number,
    max: 9999999999,
    min: 1000000000,
    required: true,
  },
  phoneOtp: {
    type: Number,
    max: 9999,
    min: 1000,
    required: true,
  },
});

module.exports = mongoose.model("Phone", phoneSchema);
