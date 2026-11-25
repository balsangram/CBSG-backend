const SECTIONS = {
  personalDetails: ["name", "phone", "fathersName", "dob"],
  address: ["address", "pinCode"],
  aadhar: ["aadhar", "aadharDocument"],
  pan: ["pan", "panDocument"],
  photo: [],
  bankAccount: ["bankName", "accountNumber", "ifscCode"],
  nominee: ["nomineeName", "nomineeRelation"],
};

const normalizeStatus = (status) => {
  if (status === "VERIFIED" || status === "REJECTED" || status === "PENDING") {
    return status;
  }

  return "PENDING";
};

const toSectionDto = (section, fields) => {
  const result = {
    status: normalizeStatus(section?.status),
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
    status: normalizeStatus(kyc.status),
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
