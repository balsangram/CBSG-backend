import Joi from "joi";

const phoneNo = Joi.string()
  .trim()
  .pattern(/^[6-9]\d{9}$/)
  .required()
  .messages({
    "string.pattern.base": "Phone number must be a valid 10 digit number",
    "any.required": "Phone number is required",
  });

const otp = Joi.string()
  .trim()
  .pattern(/^\d{6}$/)
  .required()
  .messages({
    "string.pattern.base": "OTP must be a 6 digit number",
    "any.required": "OTP is required",
  });

const id = Joi.string()
  .trim()
  .hex()
  .length(24)
  .required()
  .messages({
    "string.length": "Id must be a valid id",
    "string.hex": "Id must be a valid id",
    "any.required": "Id is required",
  });

const email = Joi.string().trim().lowercase().email().required().messages({
  "string.email": "Email must be valid",
  "any.required": "Email is required",
});

const password = Joi.string().min(8).required().messages({
  "string.min": "Password must be at least 8 characters",
  "any.required": "Password is required",
});

export const customerSendOtpSchema = Joi.object({ phoneNo });
export const customerVerifyOtpSchema = Joi.object({ phoneNo, otp, id });

export const agentSendOtpSchema = Joi.object({ phoneNo });
export const agentVerifyOtpSchema = Joi.object({ phoneNo, otp, id });

export const adminLoginSchema = Joi.object({ email, password });
export const adminVerifyOtpSchema = Joi.object({ email, otp, id });
