import mongoose from "mongoose";
import { toTargetDto, toTargetListDto } from "./admin-target.dto.js";
import {
  create,
  deleteById,
  findAll,
  findById,
  updateById,
} from "./admin-target.repository.js";

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid target id");
  }
};

const normalizeTargetData = (data, role) => {
  const next = { ...data };

  if (role === "EXECUTIVE_MANAGER") {
    next.managerCount = null;
  }

  return next;
};

const TARGET_ROLES = ["EXECUTIVE_MANAGER", "TEAM_LEAD", "MANAGER"];
const SORTABLE_FIELDS = ["name", "levelNo", "amount", "customer", "createdAt"];

const normalizeQuery = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const search =
    typeof query.search === "string" && query.search.trim()
      ? query.search.trim()
      : undefined;
  const role = TARGET_ROLES.includes(query.role) ? query.role : undefined;
  const status = ["active", "inactive"].includes(query.status) ? query.status : undefined;

  const sortField = SORTABLE_FIELDS.includes(query.sortBy) ? query.sortBy : "createdAt";
  const sortOrder = query.order === "asc" ? 1 : -1;
  const sort = { [sortField]: sortOrder };

  return { page, limit, search, role, status, sort };
};

const getTargets = async (query) => {
  const { page, limit, search, role, status, sort } = normalizeQuery(query);
  const { targets, total } = await findAll({ page, limit, search, role, status, sort });

  return {
    targets: toTargetListDto(targets),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    meta: { total },
  };
};

const createTarget = async (data) => {
  const target = await create(normalizeTargetData(data, data.role));
  return toTargetDto(target);
};

const updateTarget = async (id, data) => {
  assertId(id);

  const existing = await findById(id);
  if (!existing) {
    throw httpError(404, "Target not found");
  }

  const role = data.role || existing.role;

  if (
    role === "TEAM_LEAD" &&
    data.managerCount === undefined &&
    existing.managerCount == null
  ) {
    throw httpError(400, "Manager count is required for TEAM_LEAD");
  }

  const target = await updateById(id, normalizeTargetData(data, role));

  return toTargetDto(target);
};

const deleteTarget = async (id) => {
  assertId(id);

  const target = await deleteById(id);

  if (!target) {
    throw httpError(404, "Target not found");
  }

  return toTargetDto(target);
};

export { getTargets, createTarget, updateTarget, deleteTarget };
