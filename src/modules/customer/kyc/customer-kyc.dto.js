const SECTIONS = {
  personalDetails: ["name", "phone", "fathersName", "dob"],
  address: ["address", "pinCode"],
  aadhar: ["aadhar", "aadharDocument"],
  pan: ["pan", "panDocument"],
  photo: [],
  bankAccount: ["bankName", "accountNumber", "ifscCode"],
  nominee: ["nomineeName", "nomineeRelation"],
};

const toSectionDto = (section, fields) => {
  const result = {
    status: section?.status || "PENDING",
    rejectionReason: section?.rejectionReason || null,
  };

  if (!fields.length) return result;

  const rejectedFields = {};

  for (const field of fields) {
    rejectedFields[field] = Boolean(section?.rejectedFields?.[field]);
  }

  result.rejectedFields = rejectedFields;
  return result;
};

const toKycDto = (kyc) => {
  const data = {
    id: kyc._id,
    userId: kyc.userId,
    status: kyc.status,
    verifiedAt: kyc.verifiedAt || null,
    createdAt: kyc.createdAt,
    updatedAt: kyc.updatedAt,
  };

  for (const [key, fields] of Object.entries(SECTIONS)) {
    data[key] = toSectionDto(kyc[key], fields);
  }

  return data;
};

export { SECTIONS, toKycDto };
