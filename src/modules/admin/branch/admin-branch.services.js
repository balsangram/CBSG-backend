import mongoose from "mongoose";
import { toBranchDto, toBranchListDto } from "./admin-branch.dto.js";
import {
  create,
  deleteById,
  findAll,
  findById,
  updateById,
} from "./admin-branch.repository.js";

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid branch id");
  }
};

const getAllBranches = async () => {
  const branches = await findAll();
  return toBranchListDto(branches);
};

const getBranchById = async (id) => {
  assertId(id);

  const branch = await findById(id);

  if (!branch) {
    throw httpError(404, "Branch not found");
  }

  return toBranchDto(branch);
};

const createBranch = async (data) => {
  const branch = await create(data);
  return toBranchDto(branch);
};

const updateBranch = async (id, data) => {
  assertId(id);

  const branch = await updateById(id, data);

  if (!branch) {
    throw httpError(404, "Branch not found");
  }

  return toBranchDto(branch);
};

const deleteBranch = async (id) => {
  assertId(id);

  const branch = await deleteById(id);

  if (!branch) {
    throw httpError(404, "Branch not found");
  }

  return { id: branch._id };
};

export {
  createBranch,
  deleteBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
};
