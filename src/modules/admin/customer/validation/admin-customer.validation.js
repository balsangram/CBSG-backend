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

const agentId = Joi.string().trim().hex().length(24).required().messages({
  "any.required": "Executive is required",
  "string.length": "Executive is required",
});

const photo = Joi.string().trim().allow(null, "");

const optionalText = (max) => Joi.string().trim().max(max).allow(null, "");

export const createAdminCustomerSchema = Joi.object({
  name,
  email,
  phone,
  agentId,
  photo,
});

export const updateAdminCustomerSchema = Joi.object({
  name: name.optional(),
  email,
  phone: phone.optional(),
  agentId: agentId.optional(),
  photo,
  address: optionalText(400),
  aadhar: Joi.string()
    .trim()
    .allow(null, "")
    .pattern(/^\d{12}$/)
    .messages({
      "string.pattern.base": "Aadhaar must be 12 digits",
    }),
  pan: optionalText(10),
  bankName: optionalText(80),
  accountNumber: optionalText(30),
  ifscCode: optionalText(11),
  nominee: optionalText(80),
  nomineeRelation: optionalText(40),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required",
  });
