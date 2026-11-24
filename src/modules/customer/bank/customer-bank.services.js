import mongoose from "mongoose";
import { hasBank, toBankDto } from "./customer-bank.dto.js";
import { reopenBankAccountReview } from "../kyc/customer-kyc.services.js";
import {
  findCustomerBank,
  updateCustomerBank,
} from "./customer-bank-repositories.js";

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

const getCustomerOrThrow = async (id) => {
  const customer = await findCustomerBank(id);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  return customer;
};

const getBankDetails = async (customerId) => {
  assertCustomerId(customerId);
  const customer = await getCustomerOrThrow(customerId);
  return toBankDto(customer);
};

const saveBankDetails = async (customerId, data) => {
  assertCustomerId(customerId);
  const customer = await getCustomerOrThrow(customerId);

  if (hasBank(customer)) {
    throw httpError(409, "Bank details already exist");
  }

  const updated = await updateCustomerBank(customerId, {
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    ifscCode: data.ifscCode,
  });

  return toBankDto(updated);
};

const updateBankDetails = async (customerId, data) => {
  assertCustomerId(customerId);
  const customer = await getCustomerOrThrow(customerId);

  if (!hasBank(customer)) {
    throw httpError(404, "Bank details not found");
  }

  const updated = await updateCustomerBank(customerId, {
    bankName: data.bankName ?? customer.bankName,
    accountNumber: data.accountNumber ?? customer.accountNumber,
    ifscCode: data.ifscCode ?? customer.ifscCode,
  });

  const changed = ["bankName", "accountNumber", "ifscCode"].some(
    (key) => (customer[key] || null) !== (updated[key] || null)
  );

  if (changed) await reopenBankAccountReview(customerId);

  return toBankDto(updated);
};

const deleteBankDetails = async (customerId) => {
  assertCustomerId(customerId);
  const customer = await getCustomerOrThrow(customerId);

  if (!hasBank(customer)) {
    throw httpError(404, "Bank details not found");
  }

  const updated = await updateCustomerBank(customerId, {
    bankName: null,
    accountNumber: null,
    ifscCode: null,
  });

  return toBankDto(updated);
};

export {
  getBankDetails,
  saveBankDetails,
  updateBankDetails,
  deleteBankDetails,
};
