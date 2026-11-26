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

const toCustomerDto = (customer) => {
  if (!customer) return null;

  return {
    id: customer._id || customer,
    name: customer.name || null,
    email: customer.email || null,
    phone: customer.phone || null,
    photo: customer.photo || null,
    fathersName: customer.fathersName || null,
    dob: customer.dob || null,
    address: customer.address || null,
    pinCode: customer.pinCode || null,
    aadhar: customer.aadhar || null,
    aadharDocument: customer.aadharDocument || null,
    pan: customer.pan || null,
    panDocument: customer.panDocument || null,
    bankName: customer.bankName || null,
    accountNumber: customer.accountNumber || null,
    ifscCode: customer.ifscCode || null,
    nominee: customer.nominee || null,
    nomineeRelation: customer.nomineeRelation || null,
  };
};

const toKycDto = (kyc) => {
  const data = {
    id: kyc._id,
    userId: kyc.userId?._id || kyc.userId,
    customer: toCustomerDto(kyc.userId),
    status: normalizeStatus(kyc.status),
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
  status: normalizeStatus(kyc.status),
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
