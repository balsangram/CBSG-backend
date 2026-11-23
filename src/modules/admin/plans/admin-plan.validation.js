import Joi from "joi";

const schemeName = Joi.string().trim().min(2).max(120).required().messages({
  "any.required": "Scheme name is required",
  "string.min": "Scheme name must be at least 2 characters",
});

const planType = Joi.string().trim().min(2).max(50).required().messages({
  "any.required": "Plan type is required",
  "string.min": "Plan type must be at least 2 characters",
});

const minimumInvestmentAmount = Joi.number()
  .min(1)
  .required()
  .messages({
    "any.required": "Minimum investment amount is required",
    "number.min": "Minimum investment amount must be at least 1",
  });

const payout = Joi.number().min(1).required().messages({
  "any.required": "Payout is required",
  "number.min": "Payout must be at least 1",
});

const monthlyInterest = Joi.number().min(0).required().messages({
  "any.required": "Monthly interest is required",
  "number.min": "Monthly interest cannot be negative",
});

const monthlyInterestDate = Joi.date().allow(null).messages({
  "date.base": "Monthly interest date must be a valid date",
});

const planRule = Joi.object({
  ruleName: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().min(2).max(500).required(),
});

const planRules = Joi.array().items(planRule).default([]);

const isActive = Joi.boolean();

const status = Joi.string().valid("DRAFT", "PUBLISHED").messages({
  "any.only": "Status must be DRAFT or PUBLISHED",
});

export const createPlanSchema = Joi.object({
  schemeName,
  planType,
  minimumInvestmentAmount,
  payout,
  monthlyInterest,
  monthlyInterestDate,
  planRules,
  isActive,
  status,
});

export const updatePlanSchema = Joi.object({
  schemeName: schemeName.optional(),
  planType: planType.optional(),
  minimumInvestmentAmount: minimumInvestmentAmount.optional(),
  payout: payout.optional(),
  monthlyInterest: monthlyInterest.optional(),
  monthlyInterestDate,
  planRules,
  isActive,
  status,
}).min(1).messages({
  "object.min": "At least one field is required",
});
