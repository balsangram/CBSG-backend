import mongoose from "mongoose";
import Customer from "../../model/customer.model.js";
import Transaction from "../../model/transaction.model.js";

const SAVING_STATUSES = ["PENDING", "PROCESSING", "COMPLETED"];

const findPage = (page, limit) => {
  const skip = (page - 1) * limit;

  return Promise.all([
    Customer.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(),
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

export { findPage, findById, create, updateById, deleteById, sumSavings };
