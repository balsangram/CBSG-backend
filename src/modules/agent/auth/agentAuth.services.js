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
} from "./agentAuth.repository.js";

const OTP_TTL_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertActive = (agent) => {
  if (agent.status !== "active") {
    throw httpError(403, "Account is not active");
  }
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

const createSession = async (account, fcmToken) => {
  const payload = {
    id: account._id.toString(),
    role: account.role,
    accountModel: "Agent",
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await saveRefreshToken(account._id, refreshToken, fcmToken);

  return toSessionDto(accessToken, refreshToken, account, account.role);
};

const agentSendOtp = async ({ phone }) => {
  const agent = await findByPhone(phone);

  if (!agent) {
    throw httpError(404, "Agent not found");
  }

  assertActive(agent);

  return issueOtp(agent);
};

const agentVerifyOtp = async ({ phone, otp, id, fcmToken }) => {
  const agent = await findByPhone(phone);

  if (!agent) {
    throw httpError(404, "Agent not found");
  }

  assertActive(agent);
  await verifyOtp(agent, otp, id);

  const session = await createSession(agent, fcmToken);

  return {
    ...session,
    verifiedAt: new Date(),
  };
};

export { agentSendOtp, agentVerifyOtp };
