import mongoose from "mongoose";
import { hasBank } from "../bank/agent-bank.dto.js";
import {
  toWithdrawalDto,
  toWithdrawalListDto,
} from "./agent-withdrawal.dto.js";
import {
  createWithdrawal,
  findAgentForWithdrawal,
  findWithdrawalsByAgent,
} from "./agent-withdrawal.repository.js";

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

const submittedStamp = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const value = (type) => parts.find((part) => part.type === type).value;
  const year = Number(value("year"));
  const month = Number(value("month"));
  const day = Number(value("day"));

  return {
    submittedDate: new Date(Date.UTC(year, month - 1, day)),
    submittedTime: `${value("hour")}:${value("minute")}:${value("second")}`,
  };
};

const getAgentOrThrow = async (agentId) => {
  const agent = await findAgentForWithdrawal(agentId);

  if (!agent) {
    throw httpError(404, "Agent not found");
  }

  if (agent.status !== "active") {
    throw httpError(403, "Account is not active");
  }

  return agent;
};

const getWithdrawals = async (agentId) => {
  assertAgentId(agentId);
  await getAgentOrThrow(agentId);

  const withdrawals = await findWithdrawalsByAgent(agentId);
  return toWithdrawalListDto(withdrawals);
};

const createAgentWithdrawal = async (agentId, data) => {
  assertAgentId(agentId);
  const agent = await getAgentOrThrow(agentId);

  if (!hasBank(agent)) {
    throw httpError(400, "Add bank details before requesting a withdrawal");
  }

  const { submittedDate, submittedTime } = submittedStamp();

  const withdrawal = await createWithdrawal({
    agentId,
    amount: data.amount,
    submittedDate,
    submittedTime,
    bankName: agent.bankName,
    accountNumber: agent.accountNumber,
    ifscCode: agent.ifscCode,
    status: "pending",
  });

  return toWithdrawalDto(withdrawal);
};

export { createAgentWithdrawal, getWithdrawals };
