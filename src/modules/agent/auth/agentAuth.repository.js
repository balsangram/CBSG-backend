import Agent from "../../../model/agent.model.js";
import OTP from "../../../model/otp.model.js";

const ACCOUNT_MODEL = "Agent";

const findByPhone = (phoneNo) => Agent.findOne({ phoneNo });

const replaceOtp = async ({ accountId, otp, expiresAt }) => {
  await OTP.deleteMany({ accountId, accountModel: ACCOUNT_MODEL });

  return OTP.create({
    accountId,
    accountModel: ACCOUNT_MODEL,
    otp,
    expiresAt,
  });
};

const findOtpById = (otpId, accountId) => {
  return OTP.findOne({
    _id: otpId,
    accountId,
    accountModel: ACCOUNT_MODEL,
    isVerified: false,
  }).select("+otp");
};

const saveOtp = (otpDoc) => otpDoc.save();

const deleteOtps = (accountId) => {
  return OTP.deleteMany({ accountId, accountModel: ACCOUNT_MODEL });
};

const saveRefreshToken = (accountId, refreshToken) => {
  return Agent.findByIdAndUpdate(accountId, { refreshToken });
};

export {
  findByPhone,
  replaceOtp,
  findOtpById,
  saveOtp,
  deleteOtps,
  saveRefreshToken,
};
