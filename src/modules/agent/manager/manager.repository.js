import mongoose from "mongoose";
import Agent, { assignEmployeeId } from "../../../model/agent.model.js";
import Customer from "../../../model/customer.model.js";
import Incentive from "../../../model/incentive.model.js";
import Target from "../../../model/target.model.js";
import Transaction from "../../../model/transaction.model.js";
import Withdrawal from "../../../model/withdrawal.model.js";

const TODAY_LIMIT = 4;
const COUNTED_STATUSES = ["PENDING", "PROCESSING", "COMPLETED"];

const TARGET_ROLES = {
  executive_manager: ["EXECUTIVE_MANAGER", "MANAGER", "ExecutiveManagerLevel"],
  team_lead: ["TEAM_LEAD", "TeamLeadLevel"],
};

const istDayWindow = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === "year").value);
  const month = Number(parts.find((part) => part.type === "month").value);
  const day = Number(parts.find((part) => part.type === "day").value);

  return {
    start: new Date(Date.UTC(year, month - 1, day, -5, -30)),
    end: new Date(Date.UTC(year, month - 1, day + 1, -5, -30)),
  };
};

const findAgent = async (id) => {
  const agent = await Agent.findById(id)
    .populate("branchId", "name city")
    .populate("targetId", "name amount customer prize levelNo role isActive");

  if (agent) await assignEmployeeId(agent);

  return agent;
};

const findActiveTarget = (role) => {
  const roles = TARGET_ROLES[role] || [];
  if (!roles.length) return null;

  return Target.findOne({ role: { $in: roles }, isActive: true }).sort({
    createdAt: -1,
  });
};

const findManagerTargets = () => {
  return Target.find({
    role: { $in: TARGET_ROLES.executive_manager },
    isActive: true,
  }).sort({ levelNo: 1, createdAt: 1 });
};

const findRankedManagers = () => {
  return Agent.find({
    role: "executive_manager",
    status: "active",
  })
    .select("name photo employeeId totalCustomer totalSaving branchId targetId")
    .populate("branchId", "name city")
    .populate("targetId", "name levelNo amount customer prize");
};

const sumIncentives = (agentId) => {
  return Incentive.aggregate([
    { $match: { agentId: new mongoose.Types.ObjectId(agentId) } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
};

const summarizeWithdrawals = (agentId) => {
  return Withdrawal.aggregate([
    { $match: { agentId: new mongoose.Types.ObjectId(agentId) } },
    {
      $group: {
        _id: "$status",
        total: { $sum: "$amount" },
      },
    },
  ]);
};

const summarizeCustomers = (agentId) => {
  return Customer.aggregate([
    { $match: { agentId: new mongoose.Types.ObjectId(agentId) } },
    {
      $group: {
        _id: null,
        totalCustomer: { $sum: 1 },
        totalAmount: { $sum: "$totalSaving" },
      },
    },
  ]);
};

const agentSavingMatch = (agentId, extra = {}) => [
  {
    $match: {
      type: "SAVING",
      status: { $in: COUNTED_STATUSES },
      ...extra,
    },
  },
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
    },
  },
];

const findTodayPayers = (agentId) => {
  const { start, end } = istDayWindow();

  return Transaction.aggregate([
    ...agentSavingMatch(agentId, { createdAt: { $gte: start, $lt: end } }),
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$customer._id",
        name: { $first: "$customer.name" },
        photo: { $first: "$customer.photo" },
        amount: { $sum: "$amount" },
        paidAt: { $first: "$createdAt" },
      },
    },
    { $sort: { paidAt: -1 } },
    {
      $facet: {
        customers: [{ $limit: TODAY_LIMIT }],
        total: [{ $count: "count" }],
      },
    },
  ]);
};

const summarizeTodaySavings = (agentId) => {
  const { start, end } = istDayWindow();

  return Transaction.aggregate([
    ...agentSavingMatch(agentId, { createdAt: { $gte: start, $lt: end } }),
    {
      $group: {
        _id: null,
        todaySaving: { $sum: "$amount" },
        todayCustomerCount: { $addToSet: "$customer._id" },
      },
    },
    {
      $project: {
        _id: 0,
        todaySaving: 1,
        todayCustomerCount: { $size: "$todayCustomerCount" },
      },
    },
  ]);
};

const findTodayPayments = (agentId) => {
  const { start, end } = istDayWindow();

  return Transaction.aggregate([
    ...agentSavingMatch(agentId, { createdAt: { $gte: start, $lt: end } }),
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 0,
        id: "$_id",
        transactionId: 1,
        amount: 1,
        paymentType: 1,
        status: 1,
        paidAt: "$createdAt",
        customer: {
          id: "$customer._id",
          name: "$customer.name",
          photo: "$customer.photo",
          phone: "$customer.phone",
        },
      },
    },
  ]);
};

const findRecentSavings = (agentId, page, limit) => {
  const skip = (page - 1) * limit;

  return Transaction.aggregate([
    ...agentSavingMatch(agentId),
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              id: "$_id",
              transactionId: 1,
              amount: 1,
              paymentType: 1,
              status: 1,
              paidAt: "$createdAt",
              customer: {
                id: "$customer._id",
                name: "$customer.name",
                photo: "$customer.photo",
                phone: "$customer.phone",
              },
            },
          },
        ],
        total: [{ $count: "count" }],
      },
    },
  ]);
};

const summarizeAgentSavings = (agentId) => {
  return Transaction.aggregate([
    ...agentSavingMatch(agentId),
    {
      $group: {
        _id: null,
        totalSaving: { $sum: "$amount" },
        customers: { $addToSet: "$customer._id" },
      },
    },
    {
      $project: {
        _id: 0,
        totalSaving: 1,
        customerCount: { $size: "$customers" },
      },
    },
  ]);
};

const findSavingCustomers = (agentId, page, limit) => {
  const skip = (page - 1) * limit;
  const { start } = istDayWindow();

  return Transaction.aggregate([
    ...agentSavingMatch(agentId, { createdAt: { $lt: start } }),
    {
      $group: {
        _id: "$customer._id",
        name: { $first: "$customer.name" },
        photo: { $first: "$customer.photo" },
        phone: { $first: "$customer.phone" },
        totalSaving: { $sum: "$amount" },
        lastPaidAt: { $max: "$createdAt" },
      },
    },
    { $sort: { lastPaidAt: -1 } },
    {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              id: "$_id",
              name: 1,
              photo: 1,
              phone: 1,
              totalSaving: 1,
              lastPaidAt: 1,
            },
          },
        ],
        total: [{ $count: "count" }],
      },
    },
  ]);
};

const countCustomers = (agentId) => {
  return Customer.countDocuments({ agentId });
};

const MONTH_COUNT = 6;
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const istYearMonth = (date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year").value),
    month: Number(parts.find((part) => part.type === "month").value),
  };
};

const lastSixMonths = () => {
  const current = istYearMonth(new Date());
  const months = [];

  for (let offset = MONTH_COUNT - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(Date.UTC(current.year, current.month - 1 - offset, 1));
    months.push({
      year: cursor.getUTCFullYear(),
      month: cursor.getUTCMonth() + 1,
      name: MONTH_NAMES[cursor.getUTCMonth()],
    });
  }

  const first = months[0];

  return {
    start: new Date(Date.UTC(first.year, first.month - 1, 1, -5, -30)),
    end: new Date(Date.UTC(current.year, current.month, 1, -5, -30)),
    months,
  };
};

const summarizeIncentives = async (agentId) => {
  const { start, end, months } = lastSixMonths();
  const rows = await Incentive.aggregate([
    {
      $match: {
        agentId: new mongoose.Types.ObjectId(agentId),
        createdAt: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$createdAt",
            timezone: "Asia/Kolkata",
          },
        },
        amount: { $sum: "$amount" },
      },
    },
  ]);

  const amounts = new Map(rows.map((row) => [row._id, row.amount]));

  return months.map((entry) => {
    const key = `${entry.year}-${String(entry.month).padStart(2, "0")}`;

    return {
      month: entry.name,
      amount: amounts.get(key) || 0,
    };
  });
};

export {
  countCustomers,
  findActiveTarget,
  findAgent,
  findManagerTargets,
  findRecentSavings,
  findSavingCustomers,
  findTodayPayments,
  findTodayPayers,
  findRankedManagers,
  sumIncentives,
  summarizeAgentSavings,
  summarizeCustomers,
  summarizeIncentives,
  summarizeTodaySavings,
  summarizeWithdrawals,
};
