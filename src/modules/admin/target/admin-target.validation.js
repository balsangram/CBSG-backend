import Joi from "joi";

const ROLES = ["EXECUTIVE_MANAGER", "TEAM_LEAD", "MANAGER"];

const name = Joi.string().trim().min(2).max(80).required().messages({
  "any.required": "Name is required",
  "string.min": "Name must be at least 2 characters",
});

const amount = Joi.number().min(0).required().messages({
  "any.required": "Amount is required",
  "number.min": "Amount cannot be negative",
});

const customer = Joi.number().integer().min(0).required().messages({
  "any.required": "Customer is required",
  "number.min": "Customer cannot be negative",
  "number.integer": "Customer must be a whole number",
});

const price = Joi.number().min(0).required().messages({
  "any.required": "Price is required",
  "number.min": "Price cannot be negative",
});

const levelNo = Joi.string()
  .trim()
  .uppercase()
  .pattern(/^L\d+$/)
  .required()
  .messages({
    "any.required": "Level number is required",
    "string.pattern.base": "Level number must look like L1 or L2",
  });

const role = Joi.string()
  .valid(...ROLES)
  .required()
  .messages({
    "any.required": "Role is required",
    "any.only": "Role must be EXECUTIVE_MANAGER, TEAM_LEAD, or MANAGER",
  });

const isActive = Joi.boolean();

export const createTargetSchema = Joi.object({
  name,
  amount,
  customer,
  price,
  levelNo,
  role,
  isActive,
});

export const updateTargetSchema = Joi.object({
  name: name.optional(),
  amount: amount.optional(),
  customer: customer.optional(),
  price: price.optional(),
  levelNo: levelNo.optional(),
  role: role.optional(),
  isActive,
})
  .min(1)
  .messages({
    "object.min": "At least one field is required",
  });
