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

const toCustomerDetailDto = (customer, totalSaved) => ({
  ...toCustomerDto(customer),
  totalDays: daysFromJoining(customer.joiningDate),
  totalSaved,
});

const toCustomerListDto = (customers) => customers.map(toCustomerDto);

const toCustomerPageDto = (customers, pagination) => ({
  customers: toCustomerListDto(customers),
  pagination,
});

export { toCustomerDetailDto, toCustomerDto, toCustomerListDto, toCustomerPageDto };
