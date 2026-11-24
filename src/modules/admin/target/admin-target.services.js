import mongoose from "mongoose";
import { toTargetDto, toTargetListDto } from "./admin-target.dto.js";
import {
  create,
  deleteById,
  findAll,
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

const getTargets = async () => {
  const targets = await findAll();
  return toTargetListDto(targets);
};

const createTarget = async (data) => {
  const target = await create(data);
  return toTargetDto(target);
};

const updateTarget = async (id, data) => {
  assertId(id);

  const target = await updateById(id, data);

  if (!target) {
    throw httpError(404, "Target not found");
  }

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
