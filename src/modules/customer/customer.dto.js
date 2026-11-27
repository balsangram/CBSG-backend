const istDay = (date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year").value);
  const month = Number(parts.find((part) => part.type === "month").value);
  const day = Number(parts.find((part) => part.type === "day").value);

  return Date.UTC(year, month - 1, day);
};

const daysFromJoining = (joiningDate) => {
  if (!joiningDate) return 0;

  const days = Math.round((istDay(new Date()) - istDay(new Date(joiningDate))) / 86400000);

  return days < 0 ? 0 : days + 1;
};

const toCustomerDto = (customer) => ({
  id: customer._id,
  name: customer.name,
  email: customer.email || null,
  phone: customer.phone,
  photo: customer.photo || null,
  agentId: customer.agentId || null,
  joiningDate: customer.joiningDate,
});

const toSavingDto = (saving) => ({
  id: saving._id,
  transactionId: saving.transactionId,
  amount: saving.amount,
  paymentType: saving.paymentType || null,
  status: saving.status,
  paidAt: saving.createdAt,
});

const toCustomerDetailDto = (customer, totalSaved, recent) => ({
  ...toCustomerDto(customer),
  address: customer.address || null,
  pinCode: customer.pinCode || null,
  bank: {
    bankName: customer.bankName || null,
    accountNumber: customer.accountNumber || null,
    ifscCode: customer.ifscCode || null,
  },
  totalDays: daysFromJoining(customer.joiningDate),
  totalSaved,
  recentSavings: (recent?.items || []).map(toSavingDto),
  pagination: recent?.pagination || {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  },
});

const toCustomerListDto = (customer, balance = 0) => ({
  ...toCustomerDto(customer),
  totalDays: daysFromJoining(customer.joiningDate),
  balance,
});

const toTeamLeadDto = (teamLead) => {
  if (!teamLead?._id) return null;

  return {
    name: teamLead.name || null,
    photo: teamLead.photo || null,
  };
};

const toCustomerPageDto = (customers, balances, pagination, summary = {}) => ({
  name: summary.name || null,
  photo: summary.photo || null,
  teamLead: toTeamLeadDto(summary.teamLead),
  customerCount: summary.customerCount || 0,
  totalSaving: summary.totalSaving || 0,
  customers: customers.map((customer) =>
    toCustomerListDto(customer, balances.get(customer._id.toString()) || 0)
  ),
  pagination,
});

export { toCustomerDetailDto, toCustomerDto, toCustomerListDto, toCustomerPageDto };
