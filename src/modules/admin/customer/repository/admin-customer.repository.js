import Customer from "../../../../model/customer.model.js";
import Interest from "../../../../model/Interest.model.js";
import KYC from "../../../../model/kyc.model.js";
import OTP from "../../../../model/otp.model.js";

const agentPopulate = {
  path: "agentId",
  select: "name employeeId branchId",
  populate: { path: "branchId", select: "name city" },
};

const findAll = () => {
  return Customer.find().sort({ createdAt: -1 }).populate(agentPopulate);
};

const findById = (id) => Customer.findById(id).populate(agentPopulate);

const findKycStatuses = async (customerIds) => {
  if (!customerIds.length) return new Map();

  const rows = await KYC.find({ userId: { $in: customerIds } }).select("userId status");

  return new Map(rows.map((row) => [String(row.userId), row.status]));
};

const create = (data) => Customer.create(data);

const updateById = (id, data) => {
  return Customer.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate(agentPopulate);
};

const deleteById = async (id) => {
  const customer = await Customer.findByIdAndDelete(id);

  if (!customer) return null;

  await Promise.all([
    OTP.deleteMany({ accountId: id, accountModel: "Customer" }),
    KYC.deleteOne({ userId: id }),
    Interest.deleteOne({ userId: id }),
  ]);

  return customer;
};

export { create, deleteById, findAll, findById, findKycStatuses, updateById };
