import mongoose from "mongoose";
import {
  createKyc,
  findKycById,
  findKycByUserId,
  updateKycById,
} from "../../kyc/kyc.repositories.js";
import { SECTIONS, toKycDto } from "./customer-kyc.dto.js";

const SECTION_KEYS = Object.keys(SECTIONS);
const KYC_STATUSES = new Set(["PENDING", "VERIFIED", "REJECTED"]);

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

const normalizeStatus = (status) => {
  if (KYC_STATUSES.has(status)) return status;
  // Legacy values like UNDER_REVIEW (and anything else) map to PENDING
  return "PENDING";
};

const plainSection = (section) => {
  if (!section) return {};
  const raw =
    typeof section.toObject === "function" ? section.toObject() : { ...section };
  return {
    ...raw,
    status: normalizeStatus(raw.status),
  };
};

const mergeSection = (current, incoming, fields) => {
  const existing = plainSection(current);
  const next = {
    status: normalizeStatus(incoming.status ?? existing.status ?? "PENDING"),
    rejectionReason:
      incoming.rejectionReason === ""
        ? null
        : (incoming.rejectionReason ?? existing.rejectionReason ?? null),
  };

  if (!fields.length) return next;

  next.rejectedFields = {};

  for (const field of fields) {
    const value = incoming.rejectedFields?.[field];
    next.rejectedFields[field] =
      value === undefined ? Boolean(existing.rejectedFields?.[field]) : value;
  }

  return next;
};

const statusFor = (sections) => {
  const statuses = SECTION_KEYS.map(
    (key) => sections[key]?.status || "PENDING"
  );

  if (statuses.every((status) => status === "VERIFIED")) return "VERIFIED";
  if (statuses.some((status) => status === "REJECTED")) return "REJECTED";
  return "PENDING";
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

  const next = {};

  for (const key of SECTION_KEYS) {
    next[key] = data[key]
      ? mergeSection(kyc[key], data[key], SECTIONS[key])
      : plainSection(kyc[key]);
  }

  const updated = await updateKycById(id, {
    ...next,
    status: statusFor(next),
  });

  return toKycDto(updated);
};

const pendingSection = (fields) => {
  const section = {
    status: "PENDING",
    rejectionReason: null,
  };

  if (!fields.length) return section;

  section.rejectedFields = {};

  for (const field of fields) {
    section.rejectedFields[field] = false;
  }

  return section;
};

const reopenKycSections = async (customerId, sectionKeys) => {
  const keys = [...new Set(sectionKeys)].filter((key) =>
    SECTION_KEYS.includes(key)
  );

  if (!keys.length) return null;

  const kyc = await findKycByUserId(customerId);

  if (!kyc) return null;

  const sections = {};

  for (const key of SECTION_KEYS) {
    sections[key] = keys.includes(key)
      ? pendingSection(SECTIONS[key])
      : plainSection(kyc[key]);
  }

  const status = statusFor(sections);
  const update = {
    status: normalizeStatus(status),
    verifiedAt: status === "VERIFIED" ? kyc.verifiedAt : null,
  };

  // Write every section so legacy values like UNDER_REVIEW are normalized in DB
  for (const key of SECTION_KEYS) {
    update[key] = sections[key];
  }

  return updateKycById(kyc._id, update);
};

const reopenBankAccountReview = (customerId) =>
  reopenKycSections(customerId, ["bankAccount"]);

export {
  getKycStatus,
  getOrCreateKyc,
  reopenBankAccountReview,
  reopenKycSections,
  statusFor,
  updateKyc,
};
