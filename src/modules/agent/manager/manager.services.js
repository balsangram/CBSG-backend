import mongoose from "mongoose";
import {
  toBookDto,
  toDashboardDto,
  toIncentiveDto,
  toProfileDto,
} from "./manager.dto.js";
import {
  countCustomers,
  findActiveTarget,
  findAgent,
  findRecentSavings,
  findTodayPayments,
  findTodayPayers,
  sumIncentives,
  summarizeCustomers,
  summarizeIncentives,
  summarizeTodaySavings,
} from "./manager.repository.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const loadAgent = async (agentId) => {
  if (!mongoose.Types.ObjectId.isValid(agentId)) {
    throw httpError(401, "Invalid agent session");
  }

  const agent = await findAgent(agentId);

  if (!agent) {
    throw httpError(404, "Agent not found");
  }

  if (agent.status !== "active") {
    throw httpError(403, "Account is not active");
  }

  return agent;
};

const resolveTarget = async (agent) => {
  if (agent.targetId?._id) return agent.targetId;

  return findActiveTarget(agent.role);
};

const getProfile = async (agentId) => {
  const agent = await loadAgent(agentId);
  const target = await resolveTarget(agent);

  return toProfileDto(agent, target);
};

const getDashboard = async (agentId) => {
  const agent = await loadAgent(agentId);
  const [target, summaryRows, incentiveRows, todayRows] = await Promise.all([
    resolveTarget(agent),
    summarizeCustomers(agentId),
    sumIncentives(agentId),
    findTodayPayers(agentId),
  ]);

  const summary = summaryRows[0] || { totalCustomer: 0, totalAmount: 0 };
  const today = todayRows[0] || { customers: [], total: [] };

  return toDashboardDto(agent, target, {
    ...summary,
    incentive: incentiveRows[0]?.total || 0,
  }, {
    count: today.total?.[0]?.count || 0,
    customers: today.customers || [],
  });
};

const getIncentive = async (agentId) => {
  const agent = await loadAgent(agentId);
  const months = await summarizeIncentives(agent._id);

  return toIncentiveDto(months);
};

const pageFrom = (query = {}) => {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);

  return {
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE,
    limit:
      Number.isInteger(limit) && limit > 0
        ? Math.min(limit, MAX_LIMIT)
        : DEFAULT_LIMIT,
  };
};

const getBook = async (agentId, query) => {
  await loadAgent(agentId);

  const { page, limit } = pageFrom(query);
  const [todayRows, totalCustomer, todayPayments, recentRows] =
    await Promise.all([
      summarizeTodaySavings(agentId),
      countCustomers(agentId),
      findTodayPayments(agentId),
      findRecentSavings(agentId, page, limit),
    ]);

  const recent = recentRows[0] || { items: [], total: [] };
  const total = recent.total?.[0]?.count || 0;

  return toBookDto({
    today: todayRows[0] || { todaySaving: 0, todayCustomerCount: 0 },
    totalCustomer,
    todayPayments,
    recent: {
      items: recent.items || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    },
  });
};

export { getBook, getDashboard, getIncentive, getProfile };
