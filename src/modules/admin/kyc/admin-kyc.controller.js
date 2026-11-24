import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  approveSection as approveSectionService,
  getAllKycs as getAllKycsService,
  getKycByCustomer as getKycByCustomerService,
  rejectAll as rejectAllService,
  rejectSection as rejectSectionService,
} from "./admin-kyc.services.js";

const getAllKycs = asyncHandler(async (req, res) => {
  const data = await getAllKycsService(req.query);
  return apiResponse(res, 200, "KYC list fetched successfully", data);
});

const getKycByCustomer = asyncHandler(async (req, res) => {
  const data = await getKycByCustomerService(req.params.customerId);
  return apiResponse(res, 200, "KYC fetched successfully", data);
});

const approveSection = asyncHandler(async (req, res) => {
  const data = await approveSectionService(
    req.params.customerId,
    req.params.section,
    req.user.id
  );
  return apiResponse(res, 200, "Section approved successfully", data);
});

const rejectSection = asyncHandler(async (req, res) => {
  const data = await rejectSectionService(
    req.params.customerId,
    req.params.section,
    req.body,
    req.user.id
  );
  return apiResponse(res, 200, "Section rejected successfully", data);
});

const rejectAll = asyncHandler(async (req, res) => {
  const data = await rejectAllService(
    req.params.customerId,
    req.body.reason,
    req.user.id
  );
  return apiResponse(res, 200, "KYC rejected successfully", data);
});

export {
  approveSection,
  getAllKycs,
  getKycByCustomer,
  rejectAll,
  rejectSection,
};
