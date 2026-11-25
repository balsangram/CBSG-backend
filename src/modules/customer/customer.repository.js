import mongoose from "mongoose";
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

export {
  findPage,
  findById,
  create,
  updateById,
  deleteById,
  sumSavings,
  sumSavingsByCustomerIds,
  findRecentSavings,
};
