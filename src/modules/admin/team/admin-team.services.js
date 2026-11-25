const toAgentNode = (agent) => ({
  id: agent._id,
  name: agent.name,
  employeeId: agent.employeeId || null,
  role: agent.role,
  photo: agent.photo || null,
  status: agent.status,
  branch: agent.branchId?.name || null,
  city: agent.branchId?.city || null,
  target: agent.targetId
    ? {
        id: agent.targetId._id,
        name: agent.targetId.name,
        levelNo: agent.targetId.levelNo,
      }
    : null,
  teamLeadId: agent.teamLeadId || null,
  totalCustomer: agent.totalCustomer || 0,
  totalSaving: agent.totalSaving || 0,
});

const toCustomerNode = (customer) => ({
  id: customer._id,
  name: customer.name,
  phone: customer.phone || null,
  email: customer.email || null,
  agentId: customer.agentId || null,
});

const buildTeamTree = async ({ findAgents, findCustomersByAgentIds }) => {
  const agents = await findAgents();

  const teamLeads = agents.filter((a) => a.role === "team_lead");
  const executives = agents.filter((a) => a.role === "executive_manager");

  const execIds = executives.map((e) => e._id);
  const customers = execIds.length
    ? await findCustomersByAgentIds(execIds)
    : [];

  const customersByAgent = new Map();
  for (const customer of customers) {
    const key = String(customer.agentId);
    if (!customersByAgent.has(key)) customersByAgent.set(key, []);
    customersByAgent.get(key).push(toCustomerNode(customer));
  }

  const execsByLead = new Map();
  const unassigned = [];
  const leadIds = new Set(teamLeads.map((l) => String(l._id)));

  for (const exec of executives) {
    const node = {
      ...toAgentNode(exec),
      customers: customersByAgent.get(String(exec._id)) || [],
    };
    const leadKey = exec.teamLeadId ? String(exec.teamLeadId) : null;
    if (leadKey && leadIds.has(leadKey)) {
      if (!execsByLead.has(leadKey)) execsByLead.set(leadKey, []);
      execsByLead.get(leadKey).push(node);
    } else {
      unassigned.push(node);
    }
  }

  const tree = teamLeads.map((lead) => ({
    ...toAgentNode(lead),
    executives: execsByLead.get(String(lead._id)) || [],
  }));

  return { tree, unassigned };
};

export { buildTeamTree, toAgentNode, toCustomerNode };
