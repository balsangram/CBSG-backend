import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  getBook as getBookService,
  getDashboard as getDashboardService,
  getIncentive as getIncentiveService,
  getProfile as getProfileService,
  getTarget as getTargetService,
} from "./team-lead.services.js";

const getTeamLeadDashboard = asyncHandler(async (req, res) => {
  const data = await getDashboardService(req.user.id);
  return apiResponse(res, 200, "Dashboard fetched successfully", data);
});

const getTeamLeadIncentive = asyncHandler(async (req, res) => {
  const data = await getIncentiveService(req.user.id);
  return apiResponse(res, 200, "Incentive fetched successfully", data);
});

const getTeamLeadProfile = asyncHandler(async (req, res) => {
  const data = await getProfileService(req.user.id);
  return apiResponse(res, 200, "Profile fetched successfully", data);
});

const getTeamLeadBook = asyncHandler(async (req, res) => {
  const data = await getBookService(req.user.id, req.query);
  return apiResponse(res, 200, "Book fetched successfully", data);
});

const getTeamLeadTarget = asyncHandler(async (req, res) => {
  const data = await getTargetService(req.user.id);
  return apiResponse(res, 200, "Target fetched successfully", data);
});

export {
  getTeamLeadBook,
  getTeamLeadDashboard,
  getTeamLeadIncentive,
  getTeamLeadProfile,
  getTeamLeadTarget,
};
