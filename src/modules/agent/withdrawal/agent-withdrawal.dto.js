const toWithdrawalDto = (withdrawal) => ({
  id: withdrawal._id,
  agentId: withdrawal.agentId,
  amount: withdrawal.amount,
  submittedDate: withdrawal.submittedDate,
  submittedTime: withdrawal.submittedTime,
  bankName: withdrawal.bankName || null,
  accountNumber: withdrawal.accountNumber || null,
  ifscCode: withdrawal.ifscCode || null,
  status: withdrawal.status,
  createdAt: withdrawal.createdAt,
  updatedAt: withdrawal.updatedAt,
});

const toWithdrawalListDto = (withdrawals) => withdrawals.map(toWithdrawalDto);

export { toWithdrawalDto, toWithdrawalListDto };
