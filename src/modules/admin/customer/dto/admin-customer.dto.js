const kycLabel = (status) => {
  if (status === "VERIFIED") return "verified";
  if (status === "REJECTED") return "rejected";
  return "pending";
};

const toAdminCustomerDto = (customer, kycStatus) => {
  const agent = customer.agentId && customer.agentId.name ? customer.agentId : null;
  const branch = agent?.branchId?.name ? agent.branchId : null;

  return {
    id: customer._id,
    name: customer.name,
    email: customer.email || null,
    phone: customer.phone,
    photo: customer.photo || null,
    agentId: agent?._id || customer.agentId || null,
    executive: agent?.name || null,
    employeeId: agent?.employeeId || null,
    branch: branch?.city || branch?.name || null,
    joiningDate: customer.joiningDate || null,
    address: customer.address || null,
    pinCode: customer.pinCode || null,
    pan: customer.pan || null,
    panDocument: customer.panDocument || null,
    aadhar: customer.aadhar || null,
    aadharDocument: customer.aadharDocument || null,
    bankName: customer.bankName || null,
    accountNumber: customer.accountNumber || null,
    ifscCode: customer.ifscCode || null,
    nominee: customer.nominee || null,
    nomineeRelation: customer.nomineeRelation || null,
    monthlySaving: customer.monthlySaving || 0,
    totalSaving: customer.totalSaving || 0,
    kyc: kycLabel(kycStatus),
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
};

const toAdminCustomerListDto = (customers, kycByCustomerId) => {
  return customers.map((customer) =>
    toAdminCustomerDto(customer, kycByCustomerId.get(String(customer._id)))
  );
};

export { toAdminCustomerDto, toAdminCustomerListDto };
