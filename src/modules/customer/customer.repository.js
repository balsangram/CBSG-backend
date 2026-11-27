import mongoose from "mongoose";
import Agent from "../../model/agent.model.js";
import Customer from "../../model/customer.model.js";
import Transaction from "../../model/transaction.model.js";

const SAVING_STATUSES = ["PENDING", "PROCESSING", "COMPLETED"];

const findPage = (agentId, page, limit) => {
  const skip = (page - 1) * limit;
  const filter = { agentId };

  return Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(filter),
  ]);
};

const findById = (id) => Customer.findById(id);

const create = (data) => Customer.create(data);

const updateById = (id, data) => {
  return Customer.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deleteById = (id) => Customer.findByIdAndDelete(id);

const sumSavings = async (customerId) => {
  const [row] = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(customerId),
        type: "SAVING",
        status: { $in: SAVING_STATUSES },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return row?.total || 0;
};

const sumSavingsByCustomerIds = async (customerIds) => {
  if (!customerIds.length) return new Map();

  const rows = await Transaction.aggregate([
    {
      $match: {
        userId: {
          $in: customerIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        type: "SAVING",
        status: { $in: SAVING_STATUSES },
      },
    },
    { $group: { _id: "$userId", total: { $sum: "$amount" } } },
  ]);

  return new Map(rows.map((row) => [row._id.toString(), row.total]));
};

const sumAgentSavings = async (agentId) => {
  const [row] = await Transaction.aggregate([
    {
      $lookup: {
        from: "customers",
        localField: "userId",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: "$customer" },
    {
      $match: {
        "customer.agentId": new mongoose.Types.ObjectId(agentId),
        type: "SAVING",
        status: { $in: SAVING_STATUSES },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return row?.total || 0;
};

const findRecentSavings = (customerId, page, limit) => {
  const skip = (page - 1) * limit;
  const filter = {
    userId: customerId,
    type: "SAVING",
    status: { $in: SAVING_STATUSES },
  };

  return Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("transactionId amount paymentType status createdAt"),
    Transaction.countDocuments(filter),
  ]);
};

const CUSTOMERS_PER_MANAGER = 5;

const toCustomerPreview = (customer) => ({
  id: customer.id || customer._id,
  name: customer.name,
  photo: customer.photo || null,
  phone: customer.phone || null,
  joiningDate: customer.joiningDate || null,
  totalSaving: customer.totalSaving || 0,
});

const findOwnCustomersPage = async (teamLeadId, page, limit, search = "") => {
  const filter = { agentId: teamLeadId };
  const term = String(search || "").trim();

  if (term) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { phone: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [total, myCustomers] = await Promise.all([
    Customer.countDocuments(filter),
    Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("name photo phone joiningDate totalSaving")
      .lean(),
  ]);

  return {
    myCustomerCount: total,
    myCustomers: myCustomers.map(toCustomerPreview),
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

const findManagersWithCustomers = async (teamLeadId, page, limit, search = "") => {
  const [managers, own, ownTotalCount] = await Promise.all([
    Agent.find({
      teamLeadId,
      role: "executive_manager",
    })
      .select("name photo employeeId phone totalCustomer totalSaving")
      .sort({ createdAt: -1 })
      .lean(),
    findOwnCustomersPage(teamLeadId, page, limit, search),
    Customer.countDocuments({ agentId: teamLeadId }),
  ]);

  if (!managers.length) {
    return {
      managers: [],
      managerCount: 0,
      customerCount: ownTotalCount,
      myCustomerCount: own.pagination.total,
      myCustomers: own.myCustomers,
      search: search || null,
      pagination: own.pagination,
    };
  }

  const managerIds = managers.map((manager) => manager._id);

  const grouped = await Customer.aggregate([
    { $match: { agentId: { $in: managerIds } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$agentId",
        customerCount: { $sum: 1 },
        customers: {
          $push: {
            id: "$_id",
            name: "$name",
            photo: "$photo",
            phone: "$phone",
            joiningDate: "$joiningDate",
            totalSaving: "$totalSaving",
          },
        },
      },
    },
    {
      $project: {
        customerCount: 1,
        customers: { $slice: ["$customers", CUSTOMERS_PER_MANAGER] },
      },
    },
  ]);

  const byManager = new Map(
    grouped.map((row) => [row._id.toString(), row])
  );

  let managersCustomerCount = 0;
  const result = managers.map((manager) => {
    const stats = byManager.get(manager._id.toString());
    const count = stats?.customerCount || 0;
    managersCustomerCount += count;

    return {
      id: manager._id,
      name: manager.name,
      photo: manager.photo || null,
      phone: manager.phone || null,
      employeeId: manager.employeeId || null,
      customerCount: count,
      totalSaving: manager.totalSaving || 0,
      customers: (stats?.customers || []).map(toCustomerPreview),
    };
  });

  return {
    managers: result,
    managerCount: managers.length,
    customerCount: ownTotalCount + managersCustomerCount,
    myCustomerCount: own.pagination.total,
    myCustomers: own.myCustomers,
    search: search || null,
    pagination: own.pagination,
  };
};

export {
  findPage,
  findById,
  create,
  updateById,
  deleteById,
  sumSavings,
  sumSavingsByCustomerIds,
  sumAgentSavings,
  findRecentSavings,
  findManagersWithCustomers,
};
