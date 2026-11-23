const toKycDto = (kyc) => ({
  id: kyc._id,
  userId: kyc.userId,
  personalDetails: kyc.personalDetails,
  address: kyc.address,
  aadhaarPan: kyc.aadhaarPan,
  bankAccount: kyc.bankAccount,
  status: kyc.status,
  verifiedAt: kyc.verifiedAt || null,
  createdAt: kyc.createdAt,
  updatedAt: kyc.updatedAt,
});

export { toKycDto };
