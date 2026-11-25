const toAgentDto = (agent) => ({
  id: agent._id,
  employeeId: agent.employeeId || null,
  name: agent.name,
  email: agent.email,
  phone: agent.phone,
  photo: agent.photo || null,
  role: agent.role,
  levelId: agent.levelId || null,
  levelModel: agent.levelModel || null,
  branchId: agent.branchId || null,
  targetId: agent.targetId || null,
  teamLeadId: agent.teamLeadId || null,
  status: agent.status,
  totalCustomer: agent.totalCustomer || 0,
  totalSaving: agent.totalSaving || 0,
  createdAt: agent.createdAt,
  updatedAt: agent.updatedAt,
});

const toAgentListDto = (agents) => agents.map(toAgentDto);

export { toAgentDto, toAgentListDto };
