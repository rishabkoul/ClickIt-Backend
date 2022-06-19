const router = require("express").Router();
const User = require("../model/User");
const { editLocationValidation } = require("../validation");
const verify = require("./verifyToken");

router.post("/editlocation", verify, async (req, res) => {
  const { error } = editLocationValidation(req.body);
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
    profile.lat = req.body.lat;
    profile.lon = req.body.lon;

    await profile.save();

    res.json({ message: "saved" });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

module.exports = router;
