import Joi from "joi";

const rejectionReason = Joi.string().trim().min(3).max(500).messages({
  "string.min": "Rejection reason must be at least 3 characters",
  "string.max": "Rejection reason must be at most 500 characters",
});

const rejectedFields = Joi.object()
  .pattern(Joi.string(), Joi.boolean())
  .messages({
    "object.base": "Rejected fields must be an object of field names and booleans",
  });

const rejectSectionSchema = Joi.object({
  rejectionReason: rejectionReason.allow(null, ""),
  rejectedFields,
});

const rejectAllSchema = Joi.object({
  reason: rejectionReason.required().messages({
    "any.required": "Rejection reason is required",
  }),
});

export { rejectAllSchema, rejectSectionSchema };
