import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  deleteBankDetails as deleteBankDetailsService,
  getBankDetails as getBankDetailsService,
  saveBankDetails as saveBankDetailsService,
  updateBankDetails as updateBankDetailsService,
} from "./customer-bank.services.js";

const getBankDetails = asyncHandler(async (req, res) => {
  const data = await getBankDetailsService(req.user.id);
  return apiResponse(res, 200, "Bank details fetched successfully", data);
});

const saveBankDetails = asyncHandler(async (req, res) => {
  const data = await saveBankDetailsService(req.user.id, req.body);
  return apiResponse(res, 201, "Bank details saved successfully", data);
});

const updateBankDetails = asyncHandler(async (req, res) => {
  const data = await updateBankDetailsService(req.user.id, req.params.id, req.body);
  return apiResponse(res, 200, "Bank details updated successfully", data);
});

const deleteBankDetails = asyncHandler(async (req, res) => {
  const data = await deleteBankDetailsService(req.user.id, req.params.id);
  return apiResponse(res, 200, "Bank details deleted successfully", data);
});

export {
  getBankDetails,
  saveBankDetails,
  updateBankDetails,
  deleteBankDetails,
};
