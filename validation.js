const Joi = require("@hapi/joi");

const signUpValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    emailOtp: Joi.number().min(1000).max(9999).required(),
    phone: Joi.number().min(1000000000).max(9999999999).required(),
    phoneOtp: Joi.number().min(1000).max(9999).required(),
  });

  return schema.validate(data);
};

const loginPhoneValidation = (data) => {
  const schema = Joi.object({
    phone: Joi.number().min(1000000000).max(9999999999).required(),
    phoneOtp: Joi.number().min(1000).max(9999).required(),
  });

  return schema.validate(data);
};

const sendPhoneOtpValidation = (data) => {
  const schema = Joi.object({
    phone: Joi.number().min(1000000000).max(9999999999).required(),
  });

  return schema.validate(data);
};

const sendEmailOtpValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
  });

  return schema.validate(data);
};

const loginEmailValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    emailOtp: Joi.number().min(1000).max(9999).required(),
  });

  return schema.validate(data);
};

const editProfileValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).email().required(),
    phone: Joi.number().min(1000000000).max(9999999999).required(),
    name: Joi.string().min(5).max(255).required(),
    // photo: Joi.string().required(),
    kit: Joi.string().required(),
    ratePerDay: Joi.number().required(),
    categories: Joi.array(),
  });

  return schema.validate(data);
};

const editLocationValidation = (data) => {
  const schema = Joi.object({
    lat: Joi.number().required(),
    lon: Joi.number().required(),
    address: Joi.string().required(),
  });

  return schema.validate(data);
};

const bookingValidation = (data) => {
  const schema = Joi.object({
    booked_userId: Joi.string().required(),
    dates_booked: Joi.array().required(),
  });

  return schema.validate(data);
};

module.exports.signUpValidation = signUpValidation;
module.exports.loginPhoneValidation = loginPhoneValidation;
module.exports.loginEmailValidation = loginEmailValidation;
module.exports.sendEmailOtpValidation = sendEmailOtpValidation;
module.exports.sendPhoneOtpValidation = sendPhoneOtpValidation;
module.exports.editProfileValidation = editProfileValidation;
module.exports.editLocationValidation = editLocationValidation;
module.exports.bookingValidation = bookingValidation;
