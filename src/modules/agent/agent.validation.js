import Joi from "joi";

const name = Joi.string().trim().min(2).max(80).required().messages({
  "any.required": "Name is required",
  "string.min": "Name must be at least 2 characters",
});

const email = Joi.string().trim().lowercase().email().required().messages({
  "string.email": "Email must be valid",
  "any.required": "Email is required",
});

const phone = Joi.string()
  .trim()
  .pattern(/^[6-9]\d{9}$/)
  .required()
  .messages({
    "string.pattern.base": "Phone number must be a valid 10 digit number",
    "any.required": "Phone number is required",
  });

const role = Joi.string().valid("executive_manager", "team_lead");
const status = Joi.string().valid("active", "inactive", "blocked");
const levelId = Joi.string().trim().hex().length(24).allow(null);
const branchId = Joi.string().trim().hex().length(24).allow(null);
const targetId = Joi.string().trim().hex().length(24).allow(null);
const photo = Joi.string().trim().allow(null, "");

export const createAgentSchema = Joi.object({
  name,
  email,
  phone,
  photo,
  role,
  levelId,
  branchId,
  targetId,
  status,
});

export const updateAgentSchema = Joi.object({
  name: name.optional(),
  email: email.optional(),
  phone: phone.optional(),
  photo,
  role,
  levelId,
  branchId,
  targetId,
  status,
}).min(1).messages({
  "object.min": "At least one field is required",
});
