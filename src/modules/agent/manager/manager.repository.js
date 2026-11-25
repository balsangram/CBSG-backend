import mongoose from "mongoose";
import Agent, { assignEmployeeId } from "../../../model/agent.model.js";
import Customer from "../../../model/customer.model.js";
import ExecutiveManagerLevel from "../../../model/executiveManagerLevel.model.js";
import Incentive from "../../../model/incentive.model.js";
import Target from "../../../model/target.model.js";
import TeamLeadLevel from "../../../model/teamLeadLevel.model.js";
import Transaction from "../../../model/transaction.model.js";

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

const levelModelFor = (agent) => {
  if (agent.levelModel === "TeamLeadLevel" || agent.role === "team_lead") {
    return TeamLeadLevel;
  }

  return ExecutiveManagerLevel;
};

const findAgent = async (id) => {
  const agent = await Agent.findById(id)
    .populate("branchId", "name city")
    .populate({
      path: "levelId",
      select: "name amount customerCount priceString status",
    })
    .populate("targetId", "name amount customer price levelNo role isActive");

  if (agent?.levelId && !agent.levelId?.name) {
    const Level = levelModelFor(agent);
    agent.levelId = await Level.findById(agent.levelId).select(
      "name amount customerCount priceString status"
    );
  }

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

const sumIncentives = (agentId) => {
  return Incentive.aggregate([
    { $match: { agentId: new mongoose.Types.ObjectId(agentId) } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
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

const findTodayPayers = (agentId) => {
  const { start, end } = istDayWindow();

  return Transaction.aggregate([
    {
      $match: {
        type: "SAVING",
        status: { $in: COUNTED_STATUSES },
        createdAt: { $gte: start, $lt: end },
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
  findActiveTarget,
  findAgent,
  findTodayPayers,
  sumIncentives,
  summarizeCustomers,
  summarizeIncentives,
};
