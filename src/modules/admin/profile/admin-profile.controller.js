import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  getAdminProfile as getAdminProfileService,
  updateAdminProfile as updateAdminProfileService,
} from "./admin-profile.services.js";

const getAdminProfile = asyncHandler(async (req, res) => {
  const data = await getAdminProfileService(req.user.id);
  return apiResponse(res, 200, "Profile fetched successfully", data);
});

const updateAdminProfile = asyncHandler(async (req, res) => {
  const data = await updateAdminProfileService(req.user.id, req.body, req.file);
  return apiResponse(res, 200, "Profile updated successfully", data);
});

export { getAdminProfile, updateAdminProfile };
