import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  afterLogin as afterLoginService,
  deleteProfile as deleteProfileService,
  getProfile as getProfileService,
} from "./customer-profile.services.js";

const afterLogin = asyncHandler(async (req, res) => {
  const data = await afterLoginService(req.user.id, req.body, req.files);
  return apiResponse(res, 200, "Profile updated successfully", data);
});

const getProfile = asyncHandler(async (req, res) => {
  const data = await getProfileService(req.user.id);
  return apiResponse(res, 200, "Profile fetched successfully", data);
});

const deleteProfile = asyncHandler(async (req, res) => {
  const data = await deleteProfileService(req.user.id);
  return apiResponse(res, 200, "Account deleted successfully", data);
});

export { afterLogin, deleteProfile, getProfile };
