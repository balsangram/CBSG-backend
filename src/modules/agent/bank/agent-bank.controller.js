import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  createBank as createBankService,
  deleteBank as deleteBankService,
  getBank as getBankService,
  updateBank as updateBankService,
} from "./agent-bank.services.js";

const getBank = asyncHandler(async (req, res) => {
  const data = await getBankService(req.user.id);
  return apiResponse(res, 200, "Bank details fetched successfully", data);
});

const createBank = asyncHandler(async (req, res) => {
  const data = await createBankService(req.user.id, req.body);
  return apiResponse(res, 201, "Bank details saved successfully", data);
});

const updateBank = asyncHandler(async (req, res) => {
  const data = await updateBankService(req.user.id, req.body);
  return apiResponse(res, 200, "Bank details updated successfully", data);
});

const deleteBank = asyncHandler(async (req, res) => {
  const data = await deleteBankService(req.user.id);
  return apiResponse(res, 200, "Bank details deleted successfully", data);
});

export { createBank, deleteBank, getBank, updateBank };
