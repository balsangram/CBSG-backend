const toBankDto = (customer) => ({
  id: customer._id,
  bankName: customer.bankName || null,
  accountNumber: customer.accountNumber || null,
  ifscCode: customer.ifscCode || null,
});

export { toBankDto };
