const toTargetDto = (target) => {
  if (!target?._id) return null;

  return {
    id: target._id,
    name: target.name,
    amount: target.amount,
    customer: target.customer,
    managerCount: target.managerCount ?? null,
    prize: target.prize,
    levelNo: target.levelNo ?? null,
    role: target.role,
  };
};

const toTodayCustomerDto = (customer) => ({
  id: customer._id,
  name: customer.name,
  photo: customer.photo || null,
  amount: customer.amount,
  paidAt: customer.paidAt,
});

const toDashboardDto = (agent, target, summary, today) => ({
  photo: agent.photo || null,
  name: agent.name,
  branchName: agent.branchId?.name || null,
  employeeId: agent.employeeId || null,
  totalSaving: summary.totalSaving || 0,
  executive: summary.executive || 0,
  totalManager: summary.executive || 0,
  customer: summary.customer || 0,
  incentive: summary.incentive || 0,
  target: toTargetDto(target),
  todaySaving: {
    amount: today.amount || 0,
    customerCount: today.customerCount || 0,
    customers: (today.customers || []).map(toTodayCustomerDto),
  },
});

const toProfileDto = (agent, target) => ({
  id: agent._id,
  employeeId: agent.employeeId || null,
  name: agent.name,
  email: agent.email,
  phone: agent.phone,
  photo: agent.photo || null,
  role: agent.role,
  status: agent.status,
  branch: agent.branchId
    ? {
        id: agent.branchId._id,
        name: agent.branchId.name,
        city: agent.branchId.city,
      }
    : null,
  target: toTargetDto(target),
  totalCustomer: agent.totalCustomer || 0,
  totalSaving: agent.totalSaving || 0,
  createdAt: agent.createdAt,
});

const toIncentiveDto = (months, withdrawal = {}) => {
  const total = months.reduce((sum, month) => sum + month.amount, 0);
  const totalPending = withdrawal.totalPending || 0;
  const totalSettled = withdrawal.totalSettled || 0;
  const totalAmount = withdrawal.totalAmount || total;
  const remainingAmount = Math.max(totalAmount - totalPending - totalSettled, 0);

  return {
    months,
    total,
    totalPending,
    totalSettled,
    totalAmount,
    remainingAmount,
  };
};

const levelRank = (levelNo = "") => {
  const match = String(levelNo).match(/^L(\d+)$/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const isMineLevel = (target, mine) => {
  if (!mine?.levelNo) return false;
  return levelRank(target.levelNo) <= levelRank(mine.levelNo);
};

const toTeamLeadLevelDto = (target, mine) => ({
  id: target._id,
  name: target.name,
  amount: target.amount,
  customer: target.customer,
  managerCount: target.managerCount ?? null,
  prize: target.prize || null,
  levelNo: target.levelNo || null,
  role: target.role,
  mine: isMineLevel(target, mine),
});

const toTopTeamLeadDto = (agent, rank, isMyRank = false) => ({
  rank,
  id: agent._id,
  name: agent.name,
  photo: agent.photo || null,
  employeeId: agent.employeeId || null,
  branchName: agent.branchId?.name || null,
  levelNo: agent.targetId?.levelNo || null,
  levelName: agent.targetId?.name || null,
  totalCustomer: agent.totalCustomer || 0,
  totalSaving: agent.totalSaving || 0,
  myRank: Boolean(isMyRank),
});

const toTargetPageDto = ({ totals, levels, mine, top5, myRank, agentId }) => ({
  totalCustomer: totals.totalCustomer || 0,
  totalSaving: totals.totalSaving || 0,
  executive: totals.executive || 0,
  totalManager: totals.executive || 0,
  level: (levels || []).map((target) => toTeamLeadLevelDto(target, mine)),
  top5: (top5 || []).map((entry) =>
    toTopTeamLeadDto(
      entry.agent,
      entry.rank,
      String(entry.agent._id) === String(agentId)
    )
  ),
  myRank: myRank ? toTopTeamLeadDto(myRank.agent, myRank.rank, true) : null,
});

export {
  toDashboardDto,
  toIncentiveDto,
  toProfileDto,
  toTargetPageDto,
};
