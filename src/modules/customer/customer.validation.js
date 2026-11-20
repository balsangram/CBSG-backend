import Joi from "joi";

const name = Joi.string().trim().min(2).max(80).required().messages({
  "any.required": "Name is required",
  "string.min": "Name must be at least 2 characters",
});

const email = Joi.string().trim().lowercase().email().allow(null, "").messages({
  "string.email": "Email must be valid",
});

const phone = Joi.string()
  .trim()
  .pattern(/^[6-9]\d{9}$/)
  .required()
  .messages({
    "string.pattern.base": "Phone number must be a valid 10 digit number",
    "any.required": "Phone number is required",
  });

const joiningDate = Joi.date();
const photo = Joi.string().trim().allow(null, "");

export const createCustomerSchema = Joi.object({
  name,
  email,
  phone,
  photo,
  joiningDate,
});

export const updateCustomerSchema = Joi.object({
  name: name.optional(),
  email,
  phone: phone.optional(),
  photo,
  joiningDate,
}).min(1).messages({
  "object.min": "At least one field is required",
});
