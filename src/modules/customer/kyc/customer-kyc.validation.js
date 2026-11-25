import Joi from "joi";
import { SECTIONS } from "./customer-kyc.dto.js";

const sectionStatus = Joi.string().valid("PENDING", "VERIFIED", "REJECTED");

const sectionSchema = (fields) => {
  const shape = {
    status: sectionStatus,
    rejectionReason: Joi.string().trim().allow(null, ""),
  };

  if (fields.length) {
    const rejectedFields = {};

    for (const field of fields) {
      rejectedFields[field] = Joi.boolean();
    }

    shape.rejectedFields = Joi.object(rejectedFields);
  }

  return Joi.object(shape).min(1);
};

const updateShape = {};

for (const [key, fields] of Object.entries(SECTIONS)) {
  updateShape[key] = sectionSchema(fields);
}

const updateKycSchema = Joi.object(updateShape).min(1).messages({
  "object.min": "At least one KYC section is required",
});

export { updateKycSchema };
