const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    booked_userId: {
      type: String,
      required: true,
    },
    booked_name: {
      type: String,
      required: true,
    },
    booked_by_userId: {
      type: String,
      required: true,
    },
    booked_by_name: {
      type: String,
      required: true,
    },
    dates_booked: {
      type: [Date],
      required: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
