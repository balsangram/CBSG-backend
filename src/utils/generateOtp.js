
import env from "../config/env.js";

const generateOtp = () => {
  if (env.USE_FIXED_OTP) {
    return env.FIXED_OTP;
  }

  return String(
    Math.floor(100000 + Math.random() * 900000)
  );
};

export default generateOtp;
