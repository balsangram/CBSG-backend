const PROFILE_FIELDS = [
  "name",
  "email",
  "photo",
  "phone",
  "joiningDate",
  "fathersName",
  "dob",
  "address",
  "pinCode",
  "aadhar",
  "aadharDocument",
  "pan",
  "panDocument",
  "bankName",
  "accountNumber",
  "ifscCode",
];

const isFilled = (value) => value !== null && value !== undefined && value !== "";

const toProfileDto = (customer) => {
  const profile = { id: customer._id };

  for (const key of PROFILE_FIELDS) {
    profile[key] = customer[key] ?? null;
  }

  return {
    ...profile,
    filledFields: PROFILE_FIELDS.filter((key) => isFilled(customer[key])).length,
    totalFields: PROFILE_FIELDS.length,
  };
};

export { PROFILE_FIELDS, toProfileDto };
