const BANK_KEYS = ["bankName", "accountNumber", "ifscCode"];

const toBankDto = (customer) => ({
  bankName: customer?.bankName || null,
  accountNumber: customer?.accountNumber || null,
  ifscCode: customer?.ifscCode || null,
});

const hasBank = (customer) => BANK_KEYS.every((key) => customer?.[key]);

const applyBankFields = (customer, patch) => {
  const sent = BANK_KEYS.some((key) =>
    Object.prototype.hasOwnProperty.call(patch, key)
  );

  if (!sent) return null;

  const next = toBankDto(customer);

  for (const key of BANK_KEYS) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) next[key] = patch[key];
  }

  if (BANK_KEYS.every((key) => !next[key])) return next;

  if (BANK_KEYS.some((key) => !next[key])) {
    const error = new Error("Bank name, account number, and IFSC code are required");
    error.statusCode = 400;
    throw error;
  }

  return next;
};

export { BANK_KEYS, applyBankFields, hasBank, toBankDto };
