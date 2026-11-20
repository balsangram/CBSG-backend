import asyncHandler from "../../utils/asyncHandler.js";
import apiResponse from "../../utils/apiResponse.js";
import {
  customerSendOtp as customerSendOtpService,
  customerVerifyOtp as customerVerifyOtpService,
} from "../customer/auth/customerAuth.services.js";
import {
  agentSendOtp as agentSendOtpService,
  agentVerifyOtp as agentVerifyOtpService,
} from "../agent/auth/agentAuth.services.js";
import {
  adminLogin as adminLoginService,
  adminVerifyOtp as adminVerifyOtpService,
} from "../admin/auth/adminAuth.services.js";

const customerSendOtp = asyncHandler(async (req, res) => {
  const data = await customerSendOtpService(req.body);
  return apiResponse(res, 200, "OTP sent successfully", data);
});

const customerVerifyOtp = asyncHandler(async (req, res) => {
  const data = await customerVerifyOtpService(req.body);
  return apiResponse(res, 200, "Customer logged in successfully", data);
});

const agentSendOtp = asyncHandler(async (req, res) => {
  const data = await agentSendOtpService(req.body);
  return apiResponse(res, 200, "OTP sent successfully", data);
});

const agentVerifyOtp = asyncHandler(async (req, res) => {
  const data = await agentVerifyOtpService(req.body);
  return apiResponse(res, 200, "Agent logged in successfully", data);
});

const adminLogin = asyncHandler(async (req, res) => {
  const data = await adminLoginService(req.body);
  return apiResponse(res, 200, "OTP sent successfully", data);
});

const adminVerifyOtp = asyncHandler(async (req, res) => {
  const data = await adminVerifyOtpService(req.body);
  return apiResponse(res, 200, "Admin logged in successfully", data);
});

export {
  customerSendOtp,
  customerVerifyOtp,
  agentSendOtp,
  agentVerifyOtp,
  adminLogin,
  adminVerifyOtp,
};
