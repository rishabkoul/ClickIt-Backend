const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Email = require("../model/Email");
const Phone = require("../model/Phone");
const User = require("../model/User");
const {
  signUpValidation,
  sendPhoneOtpValidation,
  sendEmailOtpValidation,
  loginEmailValidation,
  loginPhoneValidation,
} = require("../validation");

router.post("/signup", async (req, res) => {
  const { error } = signUpValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists)
    return res.status(400).json({ message: "Email already exists" });

  const phoneExists = await User.findOne({ phone: req.body.phone });
  if (phoneExists)
    return res.status(400).json({ message: "Phone no already exists" });

  const user = new User({
    email: req.body.email,
    phone: req.body.phone,
  });

  try {
    const emailOtpEntry = await Email.findOne({
      email: req.body.email,
      emailOtp: req.body.emailOtp,
    });
    if (!emailOtpEntry)
      return res.status(400).json({ message: "Email not verified" });
    const phoneOtpEntry = await Phone.findOne({
      phone: req.body.phone,
      phoneOtp: req.body.phoneOtp,
    });
    if (!phoneOtpEntry)
      return res.status(400).json({ message: "Phone not verified" });
    const savedUser = await user.save();
    const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN_SECRET);
    res.header("auth-token", token).json({ token: token });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

router.post("/loginemail", async (req, res) => {
  const { error } = loginEmailValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const emailExists = await User.findOne({ email: req.body.email });
  if (!emailExists)
    return res.status(400).json({ message: "Email dosent exist signup first" });

  const entry = await Email.findOne({
    email: req.body.email,
    emailOtp: req.body.emailOtp,
  });
  if (!entry) return res.status(400).json({ message: "Email not verified" });

  const token = jwt.sign({ _id: emailExists._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).json({ token: token });
});

router.post("/loginphone", async (req, res) => {
  const { error } = loginPhoneValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const phoneExists = await User.findOne({ phone: req.body.phone });
  if (!phoneExists)
    return res.status(400).json({ message: "Phone dosent exist signup first" });

  const entry = await Phone.findOne({
    phone: req.body.phone,
    phoneOtp: req.body.phoneOtp,
  });
  if (!entry) return res.status(400).json({ message: "Phone not verified" });

  const token = jwt.sign({ _id: phoneExists._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).json({ token: token });
});

router.post("/sendemailotp", async (req, res) => {
  const { error } = sendEmailOtpValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const mailOtp = Math.floor(1000 + Math.random() * 9000);

  try {
    await Email.updateOne(
      { email: req.body.email },
      { email: req.body.email, emailOtp: mailOtp },
      { upsert: true }
    );
    // send otp as email
    res.json({ message: `Email Otp send ${mailOtp}` });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

router.post("/sendphoneotp", async (req, res) => {
  const { error } = sendPhoneOtpValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const phoneOtp = Math.floor(1000 + Math.random() * 9000);

  try {
    await Phone.updateOne(
      { phone: req.body.phone },
      { phone: req.body.phone, phoneOtp: phoneOtp },
      { upsert: true }
    );
    // send otp as message
    res.json({ message: `Phone Otp send ${phoneOtp}` });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

router.post("/verifyemail", async (req, res) => {
  const { error } = loginEmailValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const otpSupplied = req.body.emailOtp;

  try {
    const entryExist = await Email.findOne({
      email: req.body.email,
      emailOtp: otpSupplied,
    });
    if (entryExist) return res.json({ message: "Email verified" });
    else return res.status(400).json({ message: "Email not verified" });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

router.post("/verifyphone", async (req, res) => {
  const { error } = loginPhoneValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const otpSupplied = req.body.phoneOtp;

  try {
    const entryExist = await Phone.findOne({
      phone: req.body.phone,
      phoneOtp: otpSupplied,
    });
    if (entryExist) return res.json({ message: "Phone verified" });
    else return res.status(400).json({ message: "Phone not verified" });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

module.exports = router;
