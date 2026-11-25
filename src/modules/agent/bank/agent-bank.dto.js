const BANK_KEYS = ["bankName", "accountNumber", "ifscCode"];

const toBankDto = (agent) => ({
  bankName: agent?.bankName || null,
  accountNumber: agent?.accountNumber || null,
  ifscCode: agent?.ifscCode || null,
});

const hasBank = (agent) => BANK_KEYS.every((key) => agent?.[key]);

export { BANK_KEYS, hasBank, toBankDto };
