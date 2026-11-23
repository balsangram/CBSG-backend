import KYC from "../../model/kyc.model.js";

const findKycByUserId = (userId) => KYC.findOne({ userId });

const findKycById = (id) => KYC.findById(id);

const createKyc = (data) => KYC.create(data);

const updateKycById = (id, data) => {
  return KYC.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export { findKycByUserId, findKycById, createKyc, updateKycById };
