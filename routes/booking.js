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
      booked_name: req.body.booked_name,
      booked_by_userId: profile._id,
      booked_by_name: profile.name,
      dates_booked: dates_booked,
    });

    await booking.save();

    res.json({ booking: booking });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

router.get("/getyourbookings", verify, async (req, res) => {
  const { page = 1 } = req.query;
  const { limit = 20 } = req.query;
  const { query = "" } = req.query;

  try {
    let bookings;
    let count;
    const dates_booked = req.query.dates_booked
      ? JSON.parse(req.query.dates_booked)
      : [];

    if (dates_booked.length !== 0) {
      bookings = await Booking.find({
        dates_booked: {
          $in: dates_booked,
        },
        booked_by_userId: req.user._id,
        booked_name: new RegExp(query, "i"),
      })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      count = await Booking.find({
        dates_booked: {
          $in: dates_booked,
        },
        booked_by_userId: req.user._id,
        booked_name: new RegExp(query, "i"),
      }).countDocuments();
    } else {
      bookings = await Booking.find({
        booked_by_userId: req.user._id,
        booked_name: new RegExp(query, "i"),
      })
        .sort("-updatedAt")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      count = await Booking.find({
        booked_by_userId: req.user._id,
        booked_name: new RegExp(query, "i"),
      }).countDocuments();
    }

    res.json({
      bookings: bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({
      msg: `Server Error ${error} Most probably this have caused due to too many filters that there is no your bookings data in the database try removing some filters and trying again`,
    });
  }
});

router.get("/getbookingswhobookedyou", verify, async (req, res) => {
  const { page = 1 } = req.query;
  const { limit = 20 } = req.query;
  const { query = "" } = req.query;

  try {
    let bookings;
    let count;
    const dates_booked = req.query.dates_booked
      ? JSON.parse(req.query.dates_booked)
      : [];

    if (dates_booked.length !== 0) {
      bookings = await Booking.find({
        dates_booked: {
          $in: dates_booked,
        },
        booked_userId: req.user._id,
        booked_name: new RegExp(query, "i"),
      })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      count = await Booking.find({
        dates_booked: {
          $in: dates_booked,
        },
        booked_userId: req.user._id,
        booked_name: new RegExp(query, "i"),
      }).countDocuments();
    } else {
      bookings = await Booking.find({
        booked_userId: req.user._id,
        booked_name: new RegExp(query, "i"),
      })
        .sort("-updatedAt")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      count = await Booking.find({
        booked_userId: req.user._id,
        booked_name: new RegExp(query, "i"),
      }).countDocuments();
    }

    res.json({
      bookings: bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({
      msg: `Server Error ${error} Most probably this have caused due to too many filters that there is no your bookings data in the database try removing some filters and trying again`,
    });
  }
});

module.exports = router;
