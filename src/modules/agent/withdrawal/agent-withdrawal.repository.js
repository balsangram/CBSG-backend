import Agent from "../../../model/agent.model.js";
import Withdrawal from "../../../model/withdrawal.model.js";

const findAgentForWithdrawal = (id) => {
  return Agent.findById(id).select(
    "bankName accountNumber ifscCode status role"
  );
};

const createWithdrawal = (data) => Withdrawal.create(data);

const findWithdrawalsByAgent = (agentId) => {
  return Withdrawal.find({ agentId }).sort({ createdAt: -1 });
};

export { createWithdrawal, findAgentForWithdrawal, findWithdrawalsByAgent };
