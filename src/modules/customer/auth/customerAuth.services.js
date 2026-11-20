import generateOtp from "../../../utils/generateOtp.js";
import { comparePassword, hashPassword } from "../../../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/generateToken.js";
import { toOtpDto, toSessionDto } from "../../auth/auth.dto.js";
import {
  deleteOtps,
  findByPhone,
  findOtpById,
  replaceOtp,
  saveOtp,
  saveRefreshToken,
} from "./customerAuth.repository.js";

const OTP_TTL_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const issueOtp = async (account) => {
  const otp = generateOtp();

  const otpDoc = await replaceOtp({
    accountId: account._id,
    otp: await hashPassword(otp),
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
  });

  return toOtpDto(otpDoc, account);
};

const verifyOtp = async (account, otp, id) => {
  const otpDoc = await findOtpById(id, account._id);

  if (!otpDoc) {
    throw httpError(400, "OTP not found. Request a new OTP");
  }

  if (otpDoc.expiresAt.getTime() <= Date.now()) {
    await deleteOtps(account._id);
    throw httpError(400, "OTP has expired");
  }

  if (otpDoc.attempts >= MAX_OTP_ATTEMPTS) {
    throw httpError(429, "Too many invalid attempts. Request a new OTP");
  }

  const matched = await comparePassword(otp, otpDoc.otp);

  if (!matched) {
    otpDoc.attempts += 1;
    await saveOtp(otpDoc);
    throw httpError(400, "Invalid OTP");
  }

  await deleteOtps(account._id);
};

const createSession = async (account, role) => {
  const payload = {
    id: account._id.toString(),
    role,
    accountModel: "Customer",
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await saveRefreshToken(account._id, refreshToken);

  return toSessionDto(accessToken, refreshToken, account, role);
};

const customerSendOtp = async ({ phoneNo }) => {
  const customer = await findByPhone(phoneNo);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  return issueOtp(customer);
};

const customerVerifyOtp = async ({ phoneNo, otp, id }) => {
  const customer = await findByPhone(phoneNo);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  await verifyOtp(customer, otp, id);

  return createSession(customer, "customer");
};

export { customerSendOtp, customerVerifyOtp };
