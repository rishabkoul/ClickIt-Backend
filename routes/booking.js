const router = require("express").Router();
const Booking = require("../model/Booking");
const User = require("../model/User");
const { bookingValidation } = require("../validation");
const verify = require("./verifyToken");

router.post("/book", verify, async (req, res) => {
  const { error } = bookingValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const profile = await User.findOne({
      _id: req.user._id,
    });
    if (!profile) {
      return res
        .status(400)
        .json({ message: "User doesnt Exist try signingup" });
    }
    const dates_booked = req.body.dates_booked.map((date) => new Date(date));

    const booking = new Booking({
      booked_userId: req.body.booked_userId,
      booked_by_userId: profile._id,
      dates_booked: dates_booked,
    });

    await booking.save();

    res.json({ message: "booked" });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

module.exports = router;
