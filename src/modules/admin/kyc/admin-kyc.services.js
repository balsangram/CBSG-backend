import mongoose from "mongoose";
import {
  findKycByUserId,
  updateKycById,
} from "../../kyc/kyc.repositories.js";
import { SECTIONS, toKycDto, toKycListPageDto } from "./admin-kyc.dto.js";
import { statusFor } from "../../customer/kyc/customer-kyc.services.js";
import { countByStatus, findAll } from "./admin-kyc.repository.js";

const SECTION_KEYS = Object.keys(SECTIONS);

const KYC_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
];

const SORTABLE_FIELDS = ["createdAt", "updatedAt", "status", "verifiedAt"];

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertCustomerId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid customer id");
  }
};

const assertSection = (section) => {
  if (!SECTION_KEYS.includes(section)) {
    throw httpError(400, `Invalid section. Allowed: ${SECTION_KEYS.join(", ")}`);
  }
};

const plainSection = (section) => {
  if (!section) return {};
  return typeof section.toObject === "function" ? section.toObject() : { ...section };
};

const normalizeQuery = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));

  const sortField = SORTABLE_FIELDS.includes(query.sortBy)
    ? query.sortBy
    : "createdAt";
  const sortOrder = query.order === "asc" ? 1 : -1;
  const sort = { [sortField]: sortOrder };

  const status = KYC_STATUSES.includes(query.status) ? query.status : undefined;
  const search = typeof query.search === "string" && query.search.trim()
    ? query.search.trim()
    : undefined;

  return { page, limit, sort, status, search };
};

const getAllKycs = async (query) => {
  const { page, limit, sort, status, search } = normalizeQuery(query);

  const [statusCounts, { kycs, total }] = await Promise.all([
    countByStatus(),
    findAll({ page, limit, sort, status, search }),
  ]);

  const meta = { total: 0 };

  for (const row of statusCounts) {
    meta[row._id] = row.count;
    meta.total += row.count;
  }

  meta.pending = (meta.PENDING || 0) + (meta.IN_PROGRESS || 0);
  meta.approved = meta.VERIFIED || 0;
  meta.rejected = meta.REJECTED || 0;

  return toKycListPageDto(kycs, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }, meta);
};

const getKycByCustomer = async (customerId) => {
  assertCustomerId(customerId);

  const kyc = await findKycByUserId(customerId).populate(
    "userId",
    "name phone email photo"
  );

  if (!kyc) {
    throw httpError(404, "KYC not found for this customer");
  }

  return toKycDto(kyc);
};

const applyReview = async (kyc, adminId, changes) => {
  const sections = {};

  for (const key of SECTION_KEYS) {
    sections[key] = changes[key] || plainSection(kyc[key]);
  }

  const status = statusFor(sections);

  const updated = await updateKycById(kyc._id, {
    ...sections,
    status,
    verifiedBy: adminId,
    verifiedAt: status === "VERIFIED" ? new Date() : kyc.verifiedAt || null,
    rejectionReason: changes.rejectionReason ?? kyc.rejectionReason ?? null,
  });

  return toKycDto(updated);
};

const approveSection = async (customerId, section, adminId) => {
  assertCustomerId(customerId);
  assertSection(section);

  const kyc = await findKycByUserId(customerId).populate("userId", "name email phone photo");

  if (!kyc) {
    throw httpError(404, "KYC not found for this customer");
  }

  const existing = plainSection(kyc[section]);
  const next = {
    status: "VERIFIED",
    rejectionReason: null,
  };

  const fields = SECTIONS[section];

  if (fields.length) {
    next.rejectedFields = {};
    for (const field of fields) {
      next.rejectedFields[field] = false;
    }
  }

  return applyReview(kyc, adminId, { [section]: next });
};

const rejectSection = async (customerId, section, data, adminId) => {
  assertCustomerId(customerId);
  assertSection(section);

  const kyc = await findKycByUserId(customerId).populate("userId", "name email phone photo");

  if (!kyc) {
    throw httpError(404, "KYC not found for this customer");
  }

  const existing = plainSection(kyc[section]);
  const next = {
    status: "REJECTED",
    rejectionReason: data.rejectionReason || existing.rejectionReason || null,
  };

  const fields = SECTIONS[section];

  if (fields.length) {
    next.rejectedFields = {};

    for (const field of fields) {
      const incoming = data.rejectedFields?.[field];
      next.rejectedFields[field] =
        incoming === undefined
          ? Boolean(existing.rejectedFields?.[field])
          : Boolean(incoming);
    }
  }

  return applyReview(kyc, adminId, { [section]: next });
};

const rejectAll = async (customerId, reason, adminId) => {
  assertCustomerId(customerId);

  const kyc = await findKycByUserId(customerId).populate("userId", "name email phone photo");

  if (!kyc) {
    throw httpError(404, "KYC not found for this customer");
  }

  const changes = { rejectionReason: reason };

  for (const key of SECTION_KEYS) {
    const existing = plainSection(kyc[key]);
    const next = {
      status: "REJECTED",
      rejectionReason: reason,
    };

    if (SECTIONS[key].length) {
      next.rejectedFields = existing.rejectedFields || {};
    }

    changes[key] = next;
  }

  const updated = await updateKycById(kyc._id, {
    ...changes,
    status: "REJECTED",
    verifiedBy: adminId,
    verifiedAt: kyc.verifiedAt || null,
  });

  return toKycDto(updated);
};

export { approveSection, getAllKycs, getKycByCustomer, rejectAll, rejectSection };
