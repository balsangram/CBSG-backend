const toCustomerDto = (customer) => ({
  id: customer._id,
  name: customer.name,
  email: customer.email || null,
  phone: customer.phone,
  photo: customer.photo || null,
  agentId: customer.agentId || null,
  joiningDate: customer.joiningDate,
});

const toCustomerListDto = (customers) => customers.map(toCustomerDto);

const toCustomerPageDto = (customers, pagination) => ({
  customers: toCustomerListDto(customers),
  pagination,
});

export { toCustomerDto, toCustomerListDto, toCustomerPageDto };
