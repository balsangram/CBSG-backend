import mongoose from "mongoose";
import {
  createKyc,
  findKycById,
  findKycByUserId,
  updateKycById,
} from "../../kyc/kyc.repositories.js";
import { toKycDto } from "./customer-kyc.dto.js";

const SECTION_KEYS = ["personalDetails", "address", "aadhaarPan", "bankAccount"];

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertCustomerId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(401, "Invalid customer session");
  }
};

const statusFor = (kyc) => {
  const completed = SECTION_KEYS.filter((key) => kyc[key]).length;

  if (completed === 0) return "PENDING";
  if (completed === SECTION_KEYS.length) return "UNDER_REVIEW";
  return "IN_PROGRESS";
};

const getOrCreateKyc = async (customerId) => {
  const existing = await findKycByUserId(customerId);

  if (existing) return existing;

  try {
    return await createKyc({ userId: customerId });
  } catch (error) {
    if (error?.code !== 11000) throw error;
    return findKycByUserId(customerId);
  }
};

const getKycStatus = async (customerId) => {
  assertCustomerId(customerId);
  const kyc = await getOrCreateKyc(customerId);
  return toKycDto(kyc);
};

const updateKyc = async (customerId, id, data) => {
  assertCustomerId(customerId);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid id");
  }

  const kyc = await findKycById(id);

  if (!kyc) {
    throw httpError(404, "KYC not found");
  }

  if (kyc.userId.toString() !== customerId) {
    throw httpError(403, "You can only update your own KYC");
  }

  if (kyc.status === "VERIFIED" || kyc.status === "REJECTED") {
    throw httpError(400, "This KYC can no longer be updated");
  }

  const next = {
    personalDetails: data.personalDetails ?? kyc.personalDetails,
    address: data.address ?? kyc.address,
    aadhaarPan: data.aadhaarPan ?? kyc.aadhaarPan,
    bankAccount: data.bankAccount ?? kyc.bankAccount,
  };

  const updated = await updateKycById(id, {
    ...next,
    status: statusFor(next),
  });

  return toKycDto(updated);
};

export { getKycStatus, updateKyc };
