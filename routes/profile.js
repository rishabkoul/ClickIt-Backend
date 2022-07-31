const router = require("express").Router();
const User = require("../model/User");
const Email = require("../model/Email");
const Phone = require("../model/Phone");
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
    if (profile.email !== req.body.email) {
      await Email.deleteOne({ email: profile.email });
    }
    if (profile.phone !== req.body.phone) {
      await Phone.deleteOne({ phone: profile.phone });
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

router.get("/getotherprofile", verify, async (req, res) => {
  try {
    const profile = await User.findOne({
      _id: req.query._id,
    });
    if (!profile) return res.status(400).json({ message: "Profile not found" });

    res.json({ profile: profile });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

router.get("/getallprofiles", verify, async (req, res) => {
  const { page = 1 } = req.query;
  const { limit = 20 } = req.query;
  const { query = "" } = req.query;

  try {
    const lon = req.query.lon;
    const lat = req.query.lat;
    const categories = req.query.categories
      ? JSON.parse(req.query.categories)
      : [];
    let profiles;
    let count;
    if (req.query.rate) {
      if (req.query.sortRateAscending === "true") {
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
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },
              {
                $match: {
                  ratePerDay: { $lte: parseFloat(req.query.rate) },
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

                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },
              {
                $match: { ratePerDay: { $lte: parseFloat(req.query.rate) } },
              },
              {
                $sort: { ratePerDay: 1 },
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
                  query: {
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },
              {
                $match: { ratePerDay: { $lte: parseFloat(req.query.rate) } },
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
                  query: {
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },
              {
                $match: { ratePerDay: { $lte: parseFloat(req.query.rate) } },
              },
              {
                $sort: { ratePerDay: 1 },
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
              ratePerDay: {
                $gte: parseFloat(req.query.rate),
              },
              $or: [
                { name: new RegExp(query, "i") },
                { kit: new RegExp(query, "i") },
              ],
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

                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },
              {
                $match: { ratePerDay: { $lte: parseFloat(req.query.rate) } },
              },
              {
                $sort: { ratePerDay: 1 },
              },
              {
                $skip: (parseInt(page) - 1) * parseInt(limit),
              },
              {
                $limit: parseInt(limit),
              },
            ]);
          } else {
            count = await User.find({
              ratePerDay: {
                $gte: parseFloat(req.query.rate),
              },
              $or: [
                { name: new RegExp(query, "i") },
                { kit: new RegExp(query, "i") },
              ],
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
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },
              {
                $match: { ratePerDay: { $lte: parseFloat(req.query.rate) } },
              },
              {
                $sort: { ratePerDay: 1 },
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
      } else {
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

                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },
              {
                $match: { ratePerDay: { $lte: parseFloat(req.query.rate) } },
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

                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },
              {
                $match: { ratePerDay: { $lte: parseFloat(req.query.rate) } },
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
                  query: {
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },
              {
                $match: { ratePerDay: { $lte: parseFloat(req.query.rate) } },
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
                  query: {
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },
              {
                $match: { ratePerDay: { $lte: parseFloat(req.query.rate) } },
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
              ratePerDay: {
                $gte: parseFloat(req.query.rate),
              },
              $or: [
                { name: new RegExp(query, "i") },
                { kit: new RegExp(query, "i") },
              ],
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

                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },
              {
                $match: { ratePerDay: { $lte: parseFloat(req.query.rate) } },
              },
              {
                $skip: (parseInt(page) - 1) * parseInt(limit),
              },
              {
                $limit: parseInt(limit),
              },
            ]);
          } else {
            count = await User.find({
              ratePerDay: {
                $gte: parseFloat(req.query.rate),
              },
              $or: [
                { name: new RegExp(query, "i") },
                { kit: new RegExp(query, "i") },
              ],
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
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },
              {
                $match: { ratePerDay: { $lte: parseFloat(req.query.rate) } },
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
      }
    } else {
      if (req.query.sortRateAscending === "true") {
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

                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
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

                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },

              {
                $sort: { ratePerDay: 1 },
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
                  query: {
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
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
                  maxDistance: parseFloat(req.query.maxDistance),
                  distanceField: "distance",
                  spherical: true,
                  query: {
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },

              {
                $sort: { ratePerDay: 1 },
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
              $or: [
                { name: new RegExp(query, "i") },
                { kit: new RegExp(query, "i") },
              ],
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

                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },

              {
                $sort: { ratePerDay: 1 },
              },
              {
                $skip: (parseInt(page) - 1) * parseInt(limit),
              },
              {
                $limit: parseInt(limit),
              },
            ]);
          } else {
            count = await User.find({
              $or: [
                { name: new RegExp(query, "i") },
                { kit: new RegExp(query, "i") },
              ],
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
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
                  },
                },
              },

              {
                $sort: { ratePerDay: 1 },
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
      } else {
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

                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
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

                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
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
                  query: {
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
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
                  maxDistance: parseFloat(req.query.maxDistance),
                  distanceField: "distance",
                  spherical: true,
                  query: {
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
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
          }
        } else {
          if (categories.length !== 0) {
            count = await User.find({
              categories: {
                $in: categories,
              },
              $or: [
                { name: new RegExp(query, "i") },
                { kit: new RegExp(query, "i") },
              ],
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
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
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
            count = await User.find({
              $or: [
                { name: new RegExp(query, "i") },
                { kit: new RegExp(query, "i") },
              ],
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
                    $or: [
                      { name: new RegExp(query, "i") },
                      { kit: new RegExp(query, "i") },
                    ],
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
          }
        }
      }
    }

    res.json({
      profiles: profiles,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({
      msg: `Server Error ${error} Most probably this have caused due to too many filters that there is no photographer data in the database try removing some filters and trying again`,
    });
  }
});

module.exports = router;
