import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  createPlan as createPlanService,
  getAllPlans as getAllPlansService,
  getPlanById as getPlanByIdService,
  updatePlan as updatePlanService,
} from "./admin-plan.services.js";

const getAllPlans = asyncHandler(async (req, res) => {
  const data = await getAllPlansService();
  return apiResponse(res, 200, "Plans fetched successfully", data);
});

const getPlanById = asyncHandler(async (req, res) => {
  const data = await getPlanByIdService(req.params.id);
  return apiResponse(res, 200, "Plan fetched successfully", data);
});

const createPlan = asyncHandler(async (req, res) => {
  const data = await createPlanService(req.body);
  return apiResponse(res, 201, "Plan created successfully", data);
});

const updatePlan = asyncHandler(async (req, res) => {
  const data = await updatePlanService(req.params.id, req.body);
  return apiResponse(res, 200, "Plan updated successfully", data);
});

export { getAllPlans, getPlanById, createPlan, updatePlan };
