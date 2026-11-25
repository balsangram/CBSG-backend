import Agent from "../../../model/agent.model.js";

const BANK_FIELDS = "bankName accountNumber ifscCode";

const findAgentBank = (id) => Agent.findById(id).select(BANK_FIELDS);

const updateAgentBank = (id, data) => {
  return Agent.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).select(BANK_FIELDS);
};

export { findAgentBank, updateAgentBank };
