import mongoose from "mongoose";
import Customer from "../../../model/customer.model.js";
import Interest from "../../../model/Interest.model.js";
import Transaction from "../../../model/transaction.model.js";
import { adjustTotals } from "../../agent/agent.repository.js";

const COUNTED_STATUSES = ["PENDING", "PROCESSING", "COMPLETED"];
const RECENT_LIMIT = 4;

const monthWindow = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === "year").value);
  const month = Number(parts.find((part) => part.type === "month").value);

  return {
    start: new Date(Date.UTC(year, month - 1, 1, -5, -30)),
    end: new Date(Date.UTC(year, month, 1, -5, -30)),
  };
};

const findCustomerById = (id) => Customer.findById(id).select("_id");

const updateCustomerSavings = async (id, savings) => {
  const current = await Customer.findById(id).select("agentId totalSaving");
  const updated = await Customer.findByIdAndUpdate(
    id,
    {
      monthlySaving: savings.monthlySaving,
      totalSaving: savings.totalSaving,
    },
    { new: true, runValidators: true }
  ).select("monthlySaving totalSaving");

  if (current?.agentId) {
    await adjustTotals(current.agentId, {
      saving: savings.totalSaving - (current.totalSaving || 0),
    });
  }

  return updated;
};

const summarizeTransactions = (customerId) => {
  const { start, end } = monthWindow();

  return Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(customerId),
        status: { $in: COUNTED_STATUSES },
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        monthly: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $gte: [{ $ifNull: ["$completedAt", "$createdAt"] }, start],
                  },
                  {
                    $lt: [{ $ifNull: ["$completedAt", "$createdAt"] }, end],
                  },
                ],
              },
              "$amount",
              0,
            ],
          },
        },
      },
    },
  ]);
};

const sumTransactionsByType = (customerId) => {
  return Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(customerId),
        status: { $in: COUNTED_STATUSES },
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);
};

const findRecentTransactions = (customerId) => {
  return Transaction.find({ userId: customerId })
    .sort({ createdAt: -1 })
    .limit(RECENT_LIMIT);
};

const findTransactions = (customerId, page, limit) => {
  const skip = (page - 1) * limit;

  return Promise.all([
    Transaction.find({ userId: customerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments({ userId: customerId }),
  ]);
};

const createTransaction = (data) => Transaction.create(data);

const findInterestByCustomerId = (customerId) => {
  return Interest.findOne({ userId: customerId }).select("interest");
};

export {
  createTransaction,
  findCustomerById,
  findInterestByCustomerId,
  findRecentTransactions,
  findTransactions,
  sumTransactionsByType,
  summarizeTransactions,
  updateCustomerSavings,
};
