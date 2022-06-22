const router = require("express").Router();
const User = require("../model/User");
const { editProfileValidation } = require("../validation");
const verify = require("./verifyToken");

router.post("/editprofile", verify, async (req, res) => {
  const { error } = editProfileValidation(req.body);
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
    profile.email = req.body.email;
    profile.phone = req.body.phone;
    profile.name = req.body.name;
    // profile.photo = req.body.photo;
    profile.kit = req.body.kit;
    profile.ratePerDay = req.body.ratePerDay;

    await profile.save();

    res.json({ message: "saved" });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

router.get("/getprofile", verify, async (req, res) => {
  try {
    const profile = await User.findOne({
      _id: req.user._id,
    });
    if (!profile)
      return res
        .status(400)
        .json({ message: "Profile not found Signup to Create one" });

    res.json({ profile: profile });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

router.get("/getallprofiles", verify, async (req, res) => {
  const { page = 1 } = req.body;
  const { limit = 20 } = req.body;

  try {
    const count = await User.countDocuments();
    const profiles = await User.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [req.body.lon, req.body.lat],
          },
          // $maxDistance: 4000000,
        },
      },
    })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    res.json({
      profiles: profiles,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
