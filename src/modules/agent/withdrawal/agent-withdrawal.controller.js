import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  createAgentWithdrawal as createWithdrawalService,
  getWithdrawals as getWithdrawalsService,
} from "./agent-withdrawal.services.js";

const getWithdrawal = asyncHandler(async (req, res) => {
  const data = await getWithdrawalsService(req.user.id);
  return apiResponse(res, 200, "Withdrawals fetched successfully", data);
});

const createWithdrawal = asyncHandler(async (req, res) => {
  const data = await createWithdrawalService(req.user.id, req.body);
  return apiResponse(res, 201, "Withdrawal requested successfully", data);
});

export { createWithdrawal, getWithdrawal };
