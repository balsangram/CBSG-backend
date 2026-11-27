import mongoose from "mongoose";
import {
  toBookDto,
  toDashboardDto,
  toIncentiveDto,
  toProfileDto,
  toTargetPageDto,
} from "./manager.dto.js";
import {
  countCustomers,
  findActiveTarget,
  findAgent,
  findManagerTargets,
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

const levelRank = (levelNo = "") => {
  const match = String(levelNo).match(/^L(\d+)$/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const resolveMineLevel = (agent, levels, totalCustomer, totalSaving) => {
  const assignedId = agent.targetId?._id || agent.targetId || null;
  const assignedLevelNo = agent.targetId?.levelNo || null;

  if (assignedId) {
    const byId = levels.find((level) => String(level._id) === String(assignedId));
    if (byId) {
      return { id: byId._id, levelNo: byId.levelNo || null };
    }
  }

  if (assignedLevelNo) {
    const byLevelNo = levels.find((level) => level.levelNo === assignedLevelNo);
    if (byLevelNo) {
      return { id: byLevelNo._id, levelNo: byLevelNo.levelNo || null };
    }
  }

  const achieved = [...levels]
    .filter(
      (level) =>
        totalSaving >= (level.amount || 0) &&
        totalCustomer >= (level.customer || 0)
    )
    .sort((a, b) => levelRank(b.levelNo) - levelRank(a.levelNo))[0];

  if (achieved) {
    return { id: achieved._id, levelNo: achieved.levelNo || null };
  }

  return null;
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
  const [months, incentiveRows, withdrawalRows] = await Promise.all([
    summarizeIncentives(agent._id),
    sumIncentives(agent._id),
    summarizeWithdrawals(agent._id),
  ]);

  const totalsByStatus = Object.fromEntries(
    (withdrawalRows || []).map((row) => [row._id, row.total || 0])
  );

  return toIncentiveDto(months, {
    totalAmount: incentiveRows[0]?.total || 0,
    totalPending: totalsByStatus.pending || 0,
    totalSettled: totalsByStatus.settled || 0,
  });
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
  const [todayRows, todayPayments, totalRows, customerRows] = await Promise.all([
    summarizeTodaySavings(agentId),
    findTodayPayments(agentId),
    summarizeAgentSavings(agentId),
    findSavingCustomers(agentId, page, limit),
  ]);

  const pageData = customerRows[0] || { items: [], total: [] };
  const total = pageData.total?.[0]?.count || 0;
  const today = todayRows[0] || { todaySaving: 0, todayCustomerCount: 0 };

  return toBookDto({
    today: {
      saving: today.todaySaving || 0,
      customerCount: today.todayCustomerCount || 0,
      entries: todayPayments || [],
    },
    totals: totalRows[0] || { totalSaving: 0, customerCount: 0 },
    customers: pageData.items || [],
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  });
};

const managerLevelScore = (manager) => {
  const match = String(manager.targetId?.levelNo || "").match(/^L(\d+)$/i);
  return match ? Number(match[1]) : 0;
};

const sortManagersByLevel = (managers) => {
  return [...managers].sort((a, b) => {
    const levelDiff = managerLevelScore(b) - managerLevelScore(a);
    if (levelDiff !== 0) return levelDiff;

    const savingDiff = (b.totalSaving || 0) - (a.totalSaving || 0);
    if (savingDiff !== 0) return savingDiff;

    return (b.totalCustomer || 0) - (a.totalCustomer || 0);
  });
};

const getTarget = async (agentId) => {
  const agent = await loadAgent(agentId);

  const [totalCustomer, savingRows, levels, managers] = await Promise.all([
    countCustomers(agentId),
    summarizeAgentSavings(agentId),
    findManagerTargets(),
    findRankedManagers(),
  ]);

  const totalSaving = savingRows[0]?.totalSaving || 0;
  const mine = resolveMineLevel(agent, levels, totalCustomer, totalSaving);
  const selfId = String(agent._id);
  const ranked = sortManagersByLevel(managers).map((entry, index) => ({
    agent: entry,
    rank: index + 1,
  }));
  const top5 = ranked.slice(0, 5);
  const self = ranked.find((entry) => String(entry.agent._id) === selfId);
  const inTop5 = Boolean(self && self.rank <= 5);

  return toTargetPageDto({
    totals: {
      totalCustomer,
      totalSaving,
    },
    levels,
    mine,
    top5,
    // Inside top 5 → null; outside top 5 → show your rank entry
    myRank: inTop5 ? null : self || null,
    agentId: selfId,
  });
};

export { getBook, getDashboard, getIncentive, getProfile, getTarget };
