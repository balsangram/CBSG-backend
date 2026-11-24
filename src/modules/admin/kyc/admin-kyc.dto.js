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

const toCustomerDto = (customer) => {
  if (!customer) return null;

  return {
    id: customer._id || customer,
    name: customer.name || null,
    email: customer.email || null,
    phone: customer.phone || null,
    photo: customer.photo || null,
  };
};

const toKycDto = (kyc) => {
  const data = {
    id: kyc._id,
    userId: kyc.userId?._id || kyc.userId,
    customer: toCustomerDto(kyc.userId),
    status: kyc.status,
    rejectionReason: kyc.rejectionReason || null,
    verifiedBy: kyc.verifiedBy || null,
    verifiedAt: kyc.verifiedAt || null,
    createdAt: kyc.createdAt,
    updatedAt: kyc.updatedAt,
  };

  for (const [key, fields] of Object.entries(SECTIONS)) {
    data[key] = toSectionDto(kyc[key], fields);
  }

  return data;
};

const toKycListDto = (kyc) => ({
  id: kyc._id,
  userId: kyc.userId?._id || kyc.userId,
  customer: toCustomerDto(kyc.userId),
  status: kyc.status,
  rejectionReason: kyc.rejectionReason || null,
  verifiedBy: kyc.verifiedBy?.name || kyc.verifiedBy || null,
  verifiedAt: kyc.verifiedAt || null,
  createdAt: kyc.createdAt,
  updatedAt: kyc.updatedAt,
});

const toKycListPageDto = (kycs, pagination, meta) => ({
  kycs: kycs.map(toKycListDto),
  pagination,
  meta,
});

export { SECTIONS, toKycDto, toKycListPageDto };
