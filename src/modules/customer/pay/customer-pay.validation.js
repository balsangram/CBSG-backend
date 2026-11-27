import Joi from "joi";

const sendAmountSchema = Joi.object({
  amount: Joi.number().min(1).required().messages({
    "any.required": "Amount is required",
    "number.min": "Amount must be at least 1",
    "number.base": "Amount must be a number",
  }),
  paymentType: Joi.string()
    .valid("UPI", "BANK", "CARD", "NETBANKING")
    .default("UPI"),
});

export { sendAmountSchema };
