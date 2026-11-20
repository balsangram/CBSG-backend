const toCustomerDto = (customer) => ({
  id: customer._id,
  name: customer.name,
  email: customer.email || null,
  phone: customer.phone,
  photo: customer.photo || null,
  joiningDate: customer.joiningDate,
});

const toCustomerListDto = (customers) => customers.map(toCustomerDto);

export { toCustomerDto, toCustomerListDto };
