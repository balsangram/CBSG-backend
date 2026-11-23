import Customer from "../../../model/customer.model.js";
import Interest from "../../../model/Interest.model.js";
import KYC from "../../../model/kyc.model.js";
import OTP from "../../../model/otp.model.js";
import { PROFILE_FIELDS } from "./customer-profile.dto.js";

const PROFILE_SELECT = PROFILE_FIELDS.join(" ");

const findProfileById = (id) => Customer.findById(id).select(PROFILE_SELECT);

const updateProfileById = (id, data) => {
  return Customer.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).select(PROFILE_SELECT);
};

const deleteProfileById = async (id) => {
  const customer = await Customer.findByIdAndDelete(id);

  if (!customer) return null;

  await Promise.all([
    OTP.deleteMany({ accountId: id, accountModel: "Customer" }),
    KYC.deleteOne({ userId: id }),
    Interest.deleteOne({ userId: id }),
  ]);

  return customer;
};

export { findProfileById, updateProfileById, deleteProfileById };
