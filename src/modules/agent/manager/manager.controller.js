import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  getBook as getBookService,
  getDashboard as getDashboardService,
  getIncentive as getIncentiveService,
  getProfile as getProfileService,
} from "./manager.services.js";

const getDashboard = asyncHandler(async (req, res) => {
  const data = await getDashboardService(req.user.id);
  return apiResponse(res, 200, "Dashboard fetched successfully", data);
});

const getIncentive = asyncHandler(async (req, res) => {
  const data = await getIncentiveService(req.user.id);
  return apiResponse(res, 200, "Incentive fetched successfully", data);
});

const getProfile = asyncHandler(async (req, res) => {
  const data = await getProfileService(req.user.id);
  return apiResponse(res, 200, "Profile fetched successfully", data);
});

const getBook = asyncHandler(async (req, res) => {
  const data = await getBookService(req.user.id, req.query);
  return apiResponse(res, 200, "Book fetched successfully", data);
});

export { getBook, getDashboard, getIncentive, getProfile };
