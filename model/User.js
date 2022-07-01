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
  name: {
    type: String,
    max: 255,
    min: 5,
  },
  photo: {
    type: String,
  },
  location: {
    type: { type: String },
    coordinates: [Number],
  },
  kit: {
    type: String,
  },
  ratePerDay: {
    type: Number,
  },
  categories: {
    type: Array,
  },
  rating: {
    type: Number,
    max: 5,
    min: 0,
  },
});

userSchema.index({ location: "2dsphere" });
userSchema.index({ name: "text", kit: "text" });
module.exports = mongoose.model("User", userSchema);
