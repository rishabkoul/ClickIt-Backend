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
    profile.categories = req.body.categories;

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
  const { page = 1 } = req.query;
  const { limit = 20 } = req.query;

  try {
    const lon = req.query.lon;
    const lat = req.query.lat;
    const categories = req.query.categories
      ? JSON.parse(req.query.categories)
      : [];
    let profiles;
    let count;
    if (req.query.maxDistance) {
      if (categories.length !== 0) {
        count = await User.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [parseFloat(lon), parseFloat(lat)],
              },
              distanceField: "distance",
              maxDistance: parseFloat(req.query.maxDistance),
              spherical: true,
              query: {
                categories: {
                  $in: categories,
                },
              },
            },
          },
          { $group: { _id: null, count: { $sum: 1 } } },
        ]);

        count = count[0].count;

        profiles = await User.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [parseFloat(lon), parseFloat(lat)],
              },
              distanceField: "distance",
              maxDistance: parseFloat(req.query.maxDistance),
              spherical: true,
              query: {
                categories: {
                  $in: categories,
                },
              },
            },
          },
          {
            $skip: (parseInt(page) - 1) * parseInt(limit),
          },
          {
            $limit: parseInt(limit),
          },
        ]);
      } else {
        count = await User.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [parseFloat(lon), parseFloat(lat)],
              },
              distanceField: "distance",
              maxDistance: parseFloat(req.query.maxDistance),
              spherical: true,
            },
          },
          { $group: { _id: null, count: { $sum: 1 } } },
        ]);

        count = count[0].count;

        profiles = await User.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [parseFloat(lon), parseFloat(lat)],
              },
              maxDistance: parseFloat(req.query.maxDistance),
              distanceField: "distance",
              spherical: true,
            },
          },
          {
            $skip: (parseInt(page) - 1) * parseInt(limit),
          },
          {
            $limit: parseInt(limit),
          },
        ]);
      }
    } else {
      if (categories.length !== 0) {
        count = await User.find({
          categories: {
            $in: categories,
          },
        }).countDocuments();

        profiles = await User.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [parseFloat(lon), parseFloat(lat)],
              },
              distanceField: "distance",
              spherical: true,
              query: {
                categories: {
                  $in: categories,
                },
              },
            },
          },
          {
            $skip: (parseInt(page) - 1) * parseInt(limit),
          },
          {
            $limit: parseInt(limit),
          },
        ]);
      } else {
        count = await User.countDocuments();

        profiles = await User.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [parseFloat(lon), parseFloat(lat)],
              },
              distanceField: "distance",
              spherical: true,
            },
          },
          {
            $skip: (parseInt(page) - 1) * parseInt(limit),
          },
          {
            $limit: parseInt(limit),
          },
        ]);
      }
    }

    res.json({
      profiles: profiles,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ msg: `Server Error ${error}` });
  }
});

module.exports = router;
