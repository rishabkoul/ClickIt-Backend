const router = require("express").Router();
const verify = require("./verifyToken");

router.get("/hasaccess", verify, (req, res) => {
  res.json({ message: "yes", user: req.user });
});

module.exports = router;
