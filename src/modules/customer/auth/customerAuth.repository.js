import Customer from "../../../model/customer.model.js";
import OTP from "../../../model/otp.model.js";
import { sessionTokenUpdate } from "../../../utils/sessionTokens.js";

const ACCOUNT_MODEL = "Customer";

const findByPhone = (phone) => Customer.findOne({ phone });

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

const saveRefreshToken = (accountId, refreshToken, fcmToken) => {
  return Customer.findByIdAndUpdate(
    accountId,
    sessionTokenUpdate(refreshToken, fcmToken),
    { updatePipeline: true }
  );
};

export {
  findByPhone,
  replaceOtp,
  findOtpById,
  saveOtp,
  deleteOtps,
  saveRefreshToken,
};
