import mongoose from "mongoose";
import Customer from "../../../model/customer.model.js";
import Interest from "../../../model/Interest.model.js";
import Transaction from "../../../model/transaction.model.js";

const COMPLETED = "COMPLETED";
const RECENT_LIMIT = 5;

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

const updateCustomerSavings = (id, savings) => {
  return Customer.findByIdAndUpdate(
    id,
    {
      monthlySaving: savings.monthlySaving,
      totalSaving: savings.totalSaving,
    },
    { new: true, runValidators: true }
  ).select("monthlySaving totalSaving");
};

const summarizeTransactions = (customerId) => {
  const { start, end } = monthWindow();

  return Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(customerId),
        status: COMPLETED,
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

const findInterestByCustomerId = (customerId) => {
  return Interest.findOne({ userId: customerId }).select("interest");
};

export {
  findCustomerById,
  findInterestByCustomerId,
  findRecentTransactions,
  findTransactions,
  summarizeTransactions,
  updateCustomerSavings,
};
