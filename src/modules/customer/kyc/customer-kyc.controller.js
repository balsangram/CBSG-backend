import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  getKycStatus as getKycStatusService,
  updateKyc as updateKycService,
} from "./customer-kyc.services.js";

const kycStatus = asyncHandler(async (req, res) => {
  const data = await getKycStatusService(req.user.id);
  return apiResponse(res, 200, "KYC status fetched successfully", data);
});

const updateKyc = asyncHandler(async (req, res) => {
  const data = await updateKycService(req.user.id, req.params.id, req.body);
  return apiResponse(res, 200, "KYC updated successfully", data);
});

export { kycStatus, updateKyc };
