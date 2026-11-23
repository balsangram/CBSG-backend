import Joi from "joi";

const updateKycSchema = Joi.object({
  personalDetails: Joi.boolean(),
  address: Joi.boolean(),
  aadhaarPan: Joi.boolean(),
  bankAccount: Joi.boolean(),
})
  .min(1)
  .messages({
    "object.min": "At least one KYC section is required",
  });

export { updateKycSchema };
