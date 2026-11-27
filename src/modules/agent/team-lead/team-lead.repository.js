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
    .populate(
      "targetId",
      "name amount customer prize levelNo role isActive managerCount"
    );

  if (agent) await assignEmployeeId(agent);

  return agent;
};

const findActiveTarget = (role) => {
  const roles = TARGET_ROLES[role] || TARGET_ROLES.team_lead;

  return Target.findOne({ role: { $in: roles }, isActive: true }).sort({
    createdAt: -1,
  });
};

const findManagersUnder = (teamLeadId) => {
  return Agent.find({
    teamLeadId,
    role: "executive_manager",
  }).select("_id name photo employeeId totalCustomer totalSaving");
};

const countManagersUnder = (teamLeadId) => {
  return Agent.countDocuments({
    teamLeadId,
    role: "executive_manager",
  });
};

const networkAgentIds = async (teamLeadId) => {
  const managers = await findManagersUnder(teamLeadId);
  return [
    new mongoose.Types.ObjectId(teamLeadId),
    ...managers.map((manager) => manager._id),
  ];
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

const summarizeIncentives = async (agentId) => {
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

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === "year").value);
  const month = Number(parts.find((part) => part.type === "month").value);
  const months = [];

  for (let offset = MONTH_COUNT - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(Date.UTC(year, month - 1 - offset, 1));
    months.push({
      year: cursor.getUTCFullYear(),
      month: cursor.getUTCMonth() + 1,
      name: MONTH_NAMES[cursor.getUTCMonth()],
    });
  }

  const first = months[0];
  const start = new Date(Date.UTC(first.year, first.month - 1, 1, -5, -30));
  const end = new Date(Date.UTC(year, month, 1, -5, -30));

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

const countNetworkCustomers = async (teamLeadId) => {
  const agentIds = await networkAgentIds(teamLeadId);
  return Customer.countDocuments({ agentId: { $in: agentIds } });
};

const sumNetworkSavings = async (teamLeadId) => {
  const agentIds = await networkAgentIds(teamLeadId);

  const [row] = await Transaction.aggregate([
    {
      $match: {
        type: "SAVING",
        status: { $in: COUNTED_STATUSES },
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
        "customer.agentId": { $in: agentIds },
      },
    },
    {
      $group: {
        _id: null,
        totalSaving: { $sum: "$amount" },
      },
    },
  ]);

  return row?.totalSaving || 0;
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

const summarizeTodaySavings = (agentId) => {
  const { start, end } = istDayWindow();

  return Transaction.aggregate([
    ...agentSavingMatch(agentId, { createdAt: { $gte: start, $lt: end } }),
    {
      $group: {
        _id: null,
        todaySaving: { $sum: "$amount" },
        customers: { $addToSet: "$customer._id" },
      },
    },
    {
      $project: {
        _id: 0,
        todaySaving: 1,
        todayCustomerCount: { $size: "$customers" },
      },
    },
  ]);
};

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

const findTeamLeadTargets = () => {
  return Target.find({
    role: { $in: TARGET_ROLES.team_lead },
    isActive: true,
  }).sort({ levelNo: 1, createdAt: 1 });
};

const findRankedTeamLeads = () => {
  return Agent.find({
    role: "team_lead",
    status: "active",
  })
    .select("name photo employeeId totalCustomer totalSaving branchId targetId")
    .populate("branchId", "name city")
    .populate("targetId", "name levelNo amount customer prize managerCount");
};

export {
  countManagersUnder,
  countNetworkCustomers,
  findActiveTarget,
  findAgent,
  findManagersUnder,
  findRankedTeamLeads,
  findTeamLeadTargets,
  findTodayPayers,
  sumIncentives,
  sumNetworkSavings,
  summarizeIncentives,
  summarizeTodaySavings,
  summarizeWithdrawals,
};
