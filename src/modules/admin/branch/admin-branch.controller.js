import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  createBranch as createBranchService,
  deleteBranch as deleteBranchService,
  getAllBranches as getAllBranchesService,
  getBranchById as getBranchByIdService,
  updateBranch as updateBranchService,
} from "./admin-branch.services.js";

const getAllBranches = asyncHandler(async (req, res) => {
  const data = await getAllBranchesService();
  return apiResponse(res, 200, "Branches fetched successfully", data);
});

const getBranchById = asyncHandler(async (req, res) => {
  const data = await getBranchByIdService(req.params.id);
  return apiResponse(res, 200, "Branch fetched successfully", data);
});

const createBranch = asyncHandler(async (req, res) => {
  const data = await createBranchService(req.body);
  return apiResponse(res, 201, "Branch created successfully", data);
});

const updateBranch = asyncHandler(async (req, res) => {
  const data = await updateBranchService(req.params.id, req.body);
  return apiResponse(res, 200, "Branch updated successfully", data);
});

const deleteBranch = asyncHandler(async (req, res) => {
  const data = await deleteBranchService(req.params.id);
  return apiResponse(res, 200, "Branch deleted successfully", data);
});

export {
  createBranch,
  deleteBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
};
