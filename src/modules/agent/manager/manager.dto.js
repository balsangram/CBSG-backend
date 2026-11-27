const toBranchDto = (branch) => {
  if (!branch?._id) return null;

  return {
    id: branch._id,
    name: branch.name,
    city: branch.city,
  };
};

const toLevelDto = (target) => {
  if (!target?._id) return null;

  return {
    id: target._id,
    name: target.name,
    amount: target.amount,
    customerCount: target.customer,
    prize: target.prize || null,
    status: target.isActive === false ? "inactive" : "active",
  };
};

const toTargetDto = (target) => {
  if (!target?._id) return null;

  return {
    id: target._id,
    name: target.name,
    amount: target.amount,
    customer: target.customer,
    prize: target.prize,
    levelNo: target.levelNo ?? null,
    role: target.role,
  };
};

const toProfileDto = (agent, target) => ({
  id: agent._id,
  employeeId: agent.employeeId || null,
  name: agent.name,
  email: agent.email,
  phone: agent.phone,
  photo: agent.photo || null,
  role: agent.role,
  status: agent.status,
  branch: toBranchDto(agent.branchId),
  target: toTargetDto(target),
  totalCustomer: agent.totalCustomer || 0,
  totalSaving: agent.totalSaving || 0,
  createdAt: agent.createdAt,
});

const toTodayCustomerDto = (customer) => ({
  id: customer._id,
  name: customer.name,
  photo: customer.photo || null,
  amount: customer.amount,
  paidAt: customer.paidAt,
});

const toDashboardDto = (agent, target, summary, today) => {
  const level = toLevelDto(target);

  return {
    photo: agent.photo || null,
    employeeId: agent.employeeId || null,
    branchName: agent.branchId?.name || null,
    level: {
      id: level?.id || null,
      name: level?.name || null,
      amount: level?.amount || 0,
      customerCount: level?.customerCount || 0,
      prize: level?.prize || null,
      status: level?.status || null,
      totalCustomer: summary.totalCustomer || 0,
      totalAmount: summary.totalAmount || 0,
    },
    incentive: summary.incentive || 0,
    totalCustomer: summary.totalCustomer || 0,
    totalPaid: summary.totalAmount || 0,
    target: toTargetDto(target),
    todayCustomerCount: today.count || 0,
    todayCustomers: (today.customers || []).map(toTodayCustomerDto),
  };
};

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

const toSavingDto = (item) => ({
  id: item.id,
  transactionId: item.transactionId,
  amount: item.amount,
  paymentType: item.paymentType || null,
  status: item.status,
  paidAt: item.paidAt,
  customer: {
    id: item.customer?.id || null,
    name: item.customer?.name || null,
    photo: item.customer?.photo || null,
    phone: item.customer?.phone || null,
  },
});

const toSavingCustomerDto = (customer) => ({
  id: customer.id,
  name: customer.name || null,
  photo: customer.photo || null,
  phone: customer.phone || null,
  totalSaving: customer.totalSaving || 0,
  lastPaidAt: customer.lastPaidAt || null,
});

const toBookDto = ({ today, totals, customers, pagination }) => ({
  today: {
    saving: today.saving || 0,
    customerCount: today.customerCount || 0,
    entries: (today.entries || []).map(toSavingDto),
  },
  totalSaving: totals.totalSaving || 0,
  customerCount: totals.customerCount || 0,
  recentSaving: (customers || []).map(toSavingCustomerDto),
  pagination,
});

const levelRank = (levelNo = "") => {
  const match = String(levelNo).match(/^L(\d+)$/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const isMineLevel = (target, mine) => {
  if (!mine?.levelNo) return false;

  return levelRank(target.levelNo) <= levelRank(mine.levelNo);
};

const toManagerLevelDto = (target, mine) => ({
  id: target._id,
  name: target.name,
  amount: target.amount,
  customer: target.customer,
  prize: target.prize || null,
  levelNo: target.levelNo || null,
  role: target.role,
  mine: isMineLevel(target, mine),
});

const toTopManagerDto = (agent, rank, isMyRank = false) => ({
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
  level: (levels || []).map((target) => toManagerLevelDto(target, mine)),
  top5: (top5 || []).map((entry) =>
    toTopManagerDto(
      entry.agent,
      entry.rank,
      String(entry.agent._id) === String(agentId)
    )
  ),
  myRank: myRank
    ? toTopManagerDto(myRank.agent, myRank.rank, true)
    : null,
});

export {
  toBookDto,
  toDashboardDto,
  toIncentiveDto,
  toProfileDto,
  toTargetPageDto,
};
