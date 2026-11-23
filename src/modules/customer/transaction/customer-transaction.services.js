import mongoose from "mongoose";
import { toDashboardDto, toTransactionPageDto } from "./customer-transaction.dto.js";
import {
  findCustomerById,
  findInterestByCustomerId,
  findRecentTransactions,
  findTransactions,
  summarizeTransactions,
  updateCustomerSavings,
} from "./customer-transaction.repository.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertCustomerId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(401, "Invalid customer session");
  }
};

const amountFor = (rows, type, key) => {
  return rows.find((row) => row._id === type)?.[key] || 0;
};

const savingsFrom = (rows) => ({
  monthlySaving: amountFor(rows, "SAVING", "monthly"),
  totalSaving: amountFor(rows, "SAVING", "total"),
  totalWithdrawn: amountFor(rows, "WITHDRAWAL", "total"),
});

const loadSavings = async (customerId) => {
  const customer = await findCustomerById(customerId);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  const rows = await summarizeTransactions(customerId);
  const savings = savingsFrom(rows);
  await updateCustomerSavings(customerId, savings);

  return savings;
};

const pageFrom = (query = {}) => {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);

  return {
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE,
    limit:
      Number.isInteger(limit) && limit > 0
        ? Math.min(limit, MAX_LIMIT)
        : DEFAULT_LIMIT,
  };
};

const getDashboard = async (customerId) => {
  assertCustomerId(customerId);

  const [savings, transactions] = await Promise.all([
    loadSavings(customerId),
    findRecentTransactions(customerId),
  ]);

  return toDashboardDto(savings, transactions);
};

const getTransactions = async (customerId, query) => {
  assertCustomerId(customerId);

  const { page, limit } = pageFrom(query);
  const [savings, interest, [transactions, total]] = await Promise.all([
    loadSavings(customerId),
    findInterestByCustomerId(customerId),
    findTransactions(customerId, page, limit),
  ]);

  return toTransactionPageDto(
    {
      totalSaved: savings.totalSaving,
      totalWithdrawn: savings.totalWithdrawn,
      totalInterest: interest?.interest || 0,
    },
    transactions,
    {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    }
  );
};

export { getDashboard, getTransactions };
