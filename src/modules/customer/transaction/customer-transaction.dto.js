const toTransactionDto = (transaction) => ({
  id: transaction._id,
  transactionId: transaction.transactionId,
  type: transaction.type,
  amount: transaction.amount,
  currency: transaction.currency,
  status: transaction.status,
  paymentType: transaction.paymentType,
  failureReason: transaction.failureReason || null,
  completedAt: transaction.completedAt || null,
  createdAt: transaction.createdAt,
});

const toTransactionListDto = (transactions) => transactions.map(toTransactionDto);

const toDashboardDto = (savings, transactions) => ({
  monthlySaving: savings.monthlySaving,
  totalSaving: savings.totalSaving,
  transactions: toTransactionListDto(transactions),
});

const toTransactionPageDto = (summary, transactions, pagination) => ({
  summary,
  transactions: toTransactionListDto(transactions),
  pagination,
});

export { toDashboardDto, toTransactionDto, toTransactionPageDto };
