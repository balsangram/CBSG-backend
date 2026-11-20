const toAgentDto = (agent) => ({
  id: agent._id,
  name: agent.name,
  email: agent.email,
  phone: agent.phone,
  photo: agent.photo || null,
  role: agent.role,
  levelId: agent.levelId || null,
  levelModel: agent.levelModel || null,
  status: agent.status,
  createdAt: agent.createdAt,
  updatedAt: agent.updatedAt,
});

const toAgentListDto = (agents) => agents.map(toAgentDto);

export { toAgentDto, toAgentListDto };
