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
  });

  return schema.validate(data);
};

module.exports.signUpValidation = signUpValidation;
module.exports.loginPhoneValidation = loginPhoneValidation;
module.exports.loginEmailValidation = loginEmailValidation;
module.exports.sendEmailOtpValidation = sendEmailOtpValidation;
module.exports.sendPhoneOtpValidation = sendPhoneOtpValidation;
module.exports.editProfileValidation = editProfileValidation;
