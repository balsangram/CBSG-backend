import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  getDashboard as getDashboardService,
  getTransactions as getTransactionsService,
} from "./customer-transaction.services.js";

const dashboard = asyncHandler(async (req, res) => {
  const data = await getDashboardService(req.user.id);
  return apiResponse(res, 200, "Dashboard fetched successfully", data);
});

const transactions = asyncHandler(async (req, res) => {
  const data = await getTransactionsService(req.user.id, req.query);
  return apiResponse(res, 200, "Transactions fetched successfully", data);
});

export { dashboard, transactions };
