import Joi from "joi";

const name = Joi.string().trim().min(2).max(80).messages({
  "string.min": "Name must be at least 2 characters",
});

const email = Joi.string().trim().lowercase().email().allow(null, "").messages({
  "string.email": "Email must be valid",
});

const phone = Joi.string()
  .trim()
  .pattern(/^[6-9]\d{9}$/)
  .messages({
    "string.pattern.base": "Phone number must be a valid 10 digit number",
  });

const photo = Joi.string().trim().allow(null, "");
const joiningDate = Joi.date().messages({
  "date.base": "Joining date must be a valid date",
});

const fathersName = Joi.string().trim().min(2).max(80).allow(null, "").messages({
  "string.min": "Father's name must be at least 2 characters",
});

const dob = Joi.date().allow(null, "").messages({
  "date.base": "Date of birth must be a valid date",
});

const address = Joi.string().trim().min(5).max(300).allow(null, "").messages({
  "string.min": "Address must be at least 5 characters",
});

const pinCode = Joi.string()
  .trim()
  .pattern(/^[1-9]\d{5}$/)
  .allow(null, "")
  .messages({
    "string.pattern.base": "PIN code must be a valid 6 digit code",
  });

const aadhar = Joi.string()
  .trim()
  .pattern(/^[2-9]\d{11}$/)
  .allow(null, "")
  .messages({
    "string.pattern.base": "Aadhaar number must be a valid 12 digit number",
  });

const pan = Joi.string()
  .trim()
  .uppercase()
  .pattern(/^[A-Z]{5}\d{4}[A-Z]$/)
  .allow(null, "")
  .messages({
    "string.pattern.base": "PAN must be a valid 10 character number",
  });

const bankName = Joi.string().trim().min(2).max(80).allow(null, "").messages({
  "string.min": "Bank name must be at least 2 characters",
});

const accountNumber = Joi.string()
  .trim()
  .pattern(/^\d{9,18}$/)
  .allow(null, "")
  .messages({
    "string.pattern.base": "Account number must be 9 to 18 digits",
  });

const ifscCode = Joi.string()
  .trim()
  .uppercase()
  .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
  .allow(null, "")
  .messages({
    "string.pattern.base": "IFSC code must be valid",
  });

const document = Joi.string().trim().allow(null, "");

const afterLoginSchema = Joi.object({
  name,
  email,
  phone,
  photo,
  joiningDate,
  fathersName,
  dob,
  address,
  pinCode,
  aadhar,
  aadharDocument: document,
  pan,
  panDocument: document,
  bankName,
  accountNumber,
  ifscCode,
});

export { afterLoginSchema };
