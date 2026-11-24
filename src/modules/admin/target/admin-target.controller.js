import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  createTarget as createTargetService,
  deleteTarget as deleteTargetService,
  getTargets as getTargetsService,
  updateTarget as updateTargetService,
} from "./admin-target.services.js";

const getTargets = asyncHandler(async (req, res) => {
  const data = await getTargetsService();
  return apiResponse(res, 200, "Targets fetched successfully", data);
});

const createTarget = asyncHandler(async (req, res) => {
  const data = await createTargetService(req.body);
  return apiResponse(res, 201, "Target created successfully", data);
});

const updateTarget = asyncHandler(async (req, res) => {
  const data = await updateTargetService(req.params.id, req.body);
  return apiResponse(res, 200, "Target updated successfully", data);
});

const deleteTarget = asyncHandler(async (req, res) => {
  const data = await deleteTargetService(req.params.id);
  return apiResponse(res, 200, "Target deleted successfully", data);
});

export { getTargets, createTarget, updateTarget, deleteTarget };
