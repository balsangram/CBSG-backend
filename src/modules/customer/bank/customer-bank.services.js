import mongoose from "mongoose";
import { toBankDto } from "./customer-bank.dto.js";
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

const assertOwner = (authId, id) => {
  assertCustomerId(authId);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid id");
  }

  if (authId !== id) {
    throw httpError(403, "You can only access your own bank details");
  }
};

const hasBank = (customer) => {
  return Boolean(
    customer.bankName && customer.accountNumber && customer.ifscCode
  );
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

const updateBankDetails = async (authId, id, data) => {
  assertOwner(authId, id);
  await getCustomerOrThrow(id);

  const updated = await updateCustomerBank(id, data);
  return toBankDto(updated);
};

const deleteBankDetails = async (authId, id) => {
  assertOwner(authId, id);
  const customer = await getCustomerOrThrow(id);

  if (!customer.bankName && !customer.accountNumber && !customer.ifscCode) {
    throw httpError(404, "Bank details not found");
  }

  const updated = await updateCustomerBank(id, {
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
