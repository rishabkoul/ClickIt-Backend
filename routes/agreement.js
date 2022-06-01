const router = require("express").Router();
const Agreement = require("../model/Agreement");
const verify = require("./verifyToken");

router.post("/accept", verify, async (req, res) => {
  const agreement = new Agreement({
    userId: req.user._id,
  });
  try {
    const agreementEntry = await Agreement.findOne({
      userId: req.user._id,
    });
    if (agreementEntry)
      return res.status(400).json({ message: "Agreement Already accepted" });
    await agreement.save();

    res.json({ message: "accepted", user: req.user });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

router.get("/acceptedagreement", verify, async (req, res) => {
  try {
    const agreementEntry = await Agreement.findOne({
      userId: req.user._id,
    });
    if (!agreementEntry)
      return res.status(400).json({ message: "Agreement not accepted" });

    res.json({ message: "Agreement Accepted", user: req.user });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

module.exports = router;
