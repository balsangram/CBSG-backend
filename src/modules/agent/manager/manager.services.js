import mongoose from "mongoose";
import { toDashboardDto, toIncentiveDto, toProfileDto } from "./manager.dto.js";
import {
  findActiveTarget,
  findAgent,
  findTodayPayers,
  summarizeCustomers,
  summarizeIncentives,
} from "./manager.repository.js";

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
  const [target, summaryRows, todayRows] = await Promise.all([
    resolveTarget(agent),
    summarizeCustomers(agentId),
    findTodayPayers(agentId),
  ]);

  const summary = summaryRows[0] || { totalCustomer: 0, totalAmount: 0 };
  const today = todayRows[0] || { customers: [], total: [] };

  return toDashboardDto(agent, target, summary, {
    count: today.total?.[0]?.count || 0,
    customers: today.customers || [],
  });
};

const getIncentive = async (agentId) => {
  const agent = await loadAgent(agentId);
  const months = await summarizeIncentives(agent._id);

  return toIncentiveDto(months);
};

export { getDashboard, getIncentive, getProfile };
