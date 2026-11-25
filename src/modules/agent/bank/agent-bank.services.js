import mongoose from "mongoose";
import { hasBank, toBankDto } from "./agent-bank.dto.js";
import { findAgentBank, updateAgentBank } from "./agent-bank.repository.js";

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertAgentId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(401, "Invalid agent session");
  }
};

const getAgentOrThrow = async (id) => {
  const agent = await findAgentBank(id);

  if (!agent) {
    throw httpError(404, "Agent not found");
  }

  return agent;
};

const getBank = async (agentId) => {
  assertAgentId(agentId);
  const agent = await getAgentOrThrow(agentId);
  return toBankDto(agent);
};

const createBank = async (agentId, data) => {
  assertAgentId(agentId);
  const agent = await getAgentOrThrow(agentId);

  if (hasBank(agent)) {
    throw httpError(409, "Bank details already exist");
  }

  const updated = await updateAgentBank(agentId, {
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    ifscCode: data.ifscCode,
  });

  return toBankDto(updated);
};

const updateBank = async (agentId, data) => {
  assertAgentId(agentId);
  const agent = await getAgentOrThrow(agentId);

  if (!hasBank(agent)) {
    throw httpError(404, "Bank details not found");
  }

  const updated = await updateAgentBank(agentId, {
    bankName: data.bankName ?? agent.bankName,
    accountNumber: data.accountNumber ?? agent.accountNumber,
    ifscCode: data.ifscCode ?? agent.ifscCode,
  });

  return toBankDto(updated);
};

const deleteBank = async (agentId) => {
  assertAgentId(agentId);
  const agent = await getAgentOrThrow(agentId);

  if (!hasBank(agent)) {
    throw httpError(404, "Bank details not found");
  }

  const updated = await updateAgentBank(agentId, {
    bankName: null,
    accountNumber: null,
    ifscCode: null,
  });

  return toBankDto(updated);
};

export { createBank, deleteBank, getBank, updateBank };
