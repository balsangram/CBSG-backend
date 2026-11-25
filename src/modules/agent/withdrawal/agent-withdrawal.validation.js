import Joi from "joi";

const createWithdrawalSchema = Joi.object({
  amount: Joi.number().min(1).required().messages({
    "any.required": "Amount is required",
    "number.min": "Amount must be at least 1000",
    "number.base": "Amount must be a number",
  }),
});

export { createWithdrawalSchema };
