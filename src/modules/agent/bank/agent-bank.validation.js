import Joi from "joi";

const bankName = Joi.string().trim().min(2).max(80).required().messages({
  "any.required": "Bank name is required",
  "string.min": "Bank name must be at least 2 characters",
});

const accountNumber = Joi.string()
  .trim()
  .pattern(/^\d{9,18}$/)
  .required()
  .messages({
    "any.required": "Account number is required",
    "string.pattern.base": "Account number must be 9 to 18 digits",
  });

const ifscCode = Joi.string()
  .trim()
  .uppercase()
  .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
  .required()
  .messages({
    "any.required": "IFSC code is required",
    "string.pattern.base": "IFSC code must be valid",
  });

const saveBankSchema = Joi.object({
  bankName,
  accountNumber,
  ifscCode,
});

const updateBankSchema = Joi.object({
  bankName: bankName.optional(),
  accountNumber: accountNumber.optional(),
  ifscCode: ifscCode.optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required",
  });

export { saveBankSchema, updateBankSchema };
