import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import { customerLogout } from "./customerAuth.services.js";

const logout = asyncHandler(async (req, res) => {
  const data = await customerLogout(req.user.id, {
    refreshToken: req.body?.refreshToken ?? req.query?.refreshToken,
    fcmToken: req.body?.fcmToken ?? req.query?.fcmToken,
  });

  return apiResponse(res, 200, "Logged out successfully", data);
});

export { logout };
