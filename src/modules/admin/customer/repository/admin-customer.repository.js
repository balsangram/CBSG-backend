import Customer from "../../../../model/customer.model.js";
import Interest from "../../../../model/Interest.model.js";
import KYC from "../../../../model/kyc.model.js";
import OTP from "../../../../model/otp.model.js";
import Agent from "../../../../model/agent.model.js";
import Branch from "../../../../model/branches.model.js";

const agentPopulate = {
  path: "agentId",
  select: "name employeeId branchId",
  populate: { path: "branchId", select: "name city" },
};

const findAll = async ({ page = 1, limit = 10, search, branch } = {}) => {
  const filter = {};

  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { phone: rx }, { email: rx }];
  }

  if (branch && branch !== "All branches") {
    const branchDocs = await Branch.find({
      $or: [{ name: branch }, { city: branch }],
    }).select("_id");
    const branchIds = branchDocs.map((b) => b._id);
    const agents = await Agent.find({ branchId: { $in: branchIds } }).select("_id");
    filter.agentId = { $in: agents.map((a) => a._id) };
  }

  const [customers, total] = await Promise.all([
    Customer.find(filter)
      .sort({ createdAt: -1 })
      .populate(agentPopulate)
      .skip((page - 1) * limit)
      .limit(limit),
    Customer.countDocuments(filter),
  ]);

  return { customers, total };
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
