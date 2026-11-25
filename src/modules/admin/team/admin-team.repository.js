import Agent from "../../../model/agent.model.js";
import Customer from "../../../model/customer.model.js";

const AGENT_SELECT =
  "name employeeId role branchId targetId teamLeadId status photo totalCustomer totalSaving createdAt";

const findAgents = () =>
  Agent.find({ status: { $ne: "blocked" } })
    .select(AGENT_SELECT)
    .populate("branchId", "name city")
    .populate("targetId", "name levelNo isActive")
    .sort({ createdAt: 1 });

const findCustomersByAgentIds = (agentIds) =>
  Customer.find({ agentId: { $in: agentIds } })
    .select("name phone email agentId")
    .sort({ createdAt: -1 });

export { findAgents, findCustomersByAgentIds };
