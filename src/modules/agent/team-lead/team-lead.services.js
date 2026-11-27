import mongoose from "mongoose";
import {
  toDashboardDto,
  toIncentiveDto,
  toProfileDto,
  toTargetPageDto,
} from "./team-lead.dto.js";
import {
  countManagersUnder,
  countNetworkCustomers,
  findActiveTarget,
  findAgent,
  findRankedTeamLeads,
  findTeamLeadTargets,
  findTodayPayers,
  sumIncentives,
  sumNetworkSavings,
  summarizeIncentives,
  summarizeTodaySavings,
  summarizeWithdrawals,
} from "./team-lead.repository.js";
import { getBook as getManagerBook } from "../manager/manager.services.js";

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const loadTeamLead = async (agentId) => {
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

  if (agent.role !== "team_lead") {
    throw httpError(403, "Team lead access required");
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
    if (byId) return { id: byId._id, levelNo: byId.levelNo || null };
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

const sortByLevel = (agents) => {
  return [...agents].sort((a, b) => {
    const score = (agent) => {
      const match = String(agent.targetId?.levelNo || "").match(/^L(\d+)$/i);
      return match ? Number(match[1]) : 0;
    };

    const levelDiff = score(b) - score(a);
    if (levelDiff !== 0) return levelDiff;

    const savingDiff = (b.totalSaving || 0) - (a.totalSaving || 0);
    if (savingDiff !== 0) return savingDiff;

    return (b.totalCustomer || 0) - (a.totalCustomer || 0);
  });
};

const getDashboard = async (agentId) => {
  const agent = await loadTeamLead(agentId);

  const [
    target,
    totalSaving,
    executive,
    customer,
    incentiveRows,
    todayRows,
    todayPayers,
  ] = await Promise.all([
    resolveTarget(agent),
    sumNetworkSavings(agentId),
    countManagersUnder(agentId),
    countNetworkCustomers(agentId),
    sumIncentives(agentId),
    summarizeTodaySavings(agentId),
    findTodayPayers(agentId),
  ]);

  const todaySummary = todayRows[0] || {
    todaySaving: 0,
    todayCustomerCount: 0,
  };
  const payers = todayPayers[0] || { customers: [] };

  return toDashboardDto(
    agent,
    target,
    {
      totalSaving,
      executive,
      customer,
      incentive: incentiveRows[0]?.total || 0,
    },
    {
      amount: todaySummary.todaySaving || 0,
      customerCount: todaySummary.todayCustomerCount || 0,
      customers: payers.customers || [],
    }
  );
};

const getProfile = async (agentId) => {
  const agent = await loadTeamLead(agentId);
  const target = await resolveTarget(agent);
  return toProfileDto(agent, target);
};

const getIncentive = async (agentId) => {
  const agent = await loadTeamLead(agentId);
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

const getBook = async (agentId, query) => {
  await loadTeamLead(agentId);
  return getManagerBook(agentId, query);
};

const getTarget = async (agentId) => {
  const agent = await loadTeamLead(agentId);

  const [totalCustomer, totalSaving, executive, levels, teamLeads] =
    await Promise.all([
      countNetworkCustomers(agentId),
      sumNetworkSavings(agentId),
      countManagersUnder(agentId),
      findTeamLeadTargets(),
      findRankedTeamLeads(),
    ]);

  const mine = resolveMineLevel(agent, levels, totalCustomer, totalSaving);
  const selfId = String(agent._id);
  const ranked = sortByLevel(teamLeads).map((entry, index) => ({
    agent: entry,
    rank: index + 1,
  }));
  const top5 = ranked.slice(0, 5);
  const self = ranked.find((entry) => String(entry.agent._id) === selfId);
  const inTop5 = Boolean(self && self.rank <= 5);

  return toTargetPageDto({
    totals: { totalCustomer, totalSaving, executive },
    levels,
    mine,
    top5,
    myRank: inTop5 ? null : self || null,
    agentId: selfId,
  });
};

export { getBook, getDashboard, getIncentive, getProfile, getTarget };
