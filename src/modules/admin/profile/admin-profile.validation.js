import Joi from "joi";

const name = Joi.string().trim().min(2).max(80).messages({
  "string.min": "Name must be at least 2 characters",
});

const email = Joi.string().trim().lowercase().email().messages({
  "string.email": "Email must be valid",
});

const phone = Joi.string()
  .trim()
  .pattern(/^[6-9]\d{9}$/)
  .messages({
    "string.pattern.base": "Phone number must be a valid 10 digit number",
  });

const photo = Joi.string().trim().allow(null, "");

export const updateAdminProfileSchema = Joi.object({
  name,
  email,
  phone,
  photo,
})
  .min(1)
  .messages({
    "object.min": "At least one field is required",
  });
