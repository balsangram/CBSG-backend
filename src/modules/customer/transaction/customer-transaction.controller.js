import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
  getDashboard as getDashboardService,
  getTransactions as getTransactionsService,
  sendAmount as sendAmountService,
} from "./customer-transaction.services.js";

const dashboard = asyncHandler(async (req, res) => {
  const data = await getDashboardService(req.user.id);
  return apiResponse(res, 200, "Dashboard fetched successfully", data);
});

const sendAmountToAdmin = asyncHandler(async (req, res) => {
  const data = await sendAmountService(req.user.id, {
    ...req.body,
    type: "SAVING",
  });
  return apiResponse(res, 201, "Amount sent successfully", data);
});

const withdrawAmount = asyncHandler(async (req, res) => {
  const data = await sendAmountService(req.user.id, {
    ...req.body,
    type: "WITHDRAWAL",
  });
  return apiResponse(res, 201, "Amount sent successfully", data);
});

const transactions = asyncHandler(async (req, res) => {
  const data = await getTransactionsService(req.user.id, req.query);
  return apiResponse(res, 200, "Transactions fetched successfully", data);
});

export { dashboard, sendAmountToAdmin, transactions, withdrawAmount };
