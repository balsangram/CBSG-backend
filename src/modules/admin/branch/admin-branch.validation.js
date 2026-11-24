import Joi from "joi";

const name = Joi.string().trim().min(2).max(120).required().messages({
  "any.required": "Branch name is required",
  "string.min": "Branch name must be at least 2 characters",
});

const city = Joi.string().trim().min(2).max(80).required().messages({
  "any.required": "City is required",
  "string.min": "City must be at least 2 characters",
});

export const createBranchSchema = Joi.object({
  name,
  city,
});

export const updateBranchSchema = Joi.object({
  name: name.optional(),
  city: city.optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required",
  });
