import mongoose from "mongoose";
import { toPlanDto, toPlanListDto } from "./admin-plan.dto.js";
import {
  create,
  findAll,
  findById,
  updateById,
} from "./admin-plan.repository.js";

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid plan id");
  }
};

const getAllPlans = async () => {
  const plans = await findAll();
  return toPlanListDto(plans);
};

const getPlanById = async (id) => {
  assertId(id);

  const plan = await findById(id);

  if (!plan) {
    throw httpError(404, "Plan not found");
  }

  return toPlanDto(plan);
};

const createPlan = async (data) => {
  const plan = await create(data);
  return toPlanDto(plan);
};

const updatePlan = async (id, data) => {
  assertId(id);

  if (data.status !== undefined) {
    data.isActive = data.status === "PUBLISHED";
  } else if (data.isActive !== undefined) {
    data.status = data.isActive ? "PUBLISHED" : "DRAFT";
  }

  const plan = await updateById(id, data);

  if (!plan) {
    throw httpError(404, "Plan not found");
  }

  return toPlanDto(plan);
};

export { getAllPlans, getPlanById, createPlan, updatePlan };
