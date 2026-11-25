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
    priceString: target.price == null ? null : String(target.price),
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
    price: target.price,
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
  level: toLevelDto(target),
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
      priceString: level?.priceString || null,
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

const toIncentiveDto = (months) => {
  const total = months.reduce((sum, month) => sum + month.amount, 0);

  return {
    months,
    total,
  };
};

export { toDashboardDto, toIncentiveDto, toProfileDto };
