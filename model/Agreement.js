const mongoose = require("mongoose");

const agreementSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Agreement", agreementSchema);
