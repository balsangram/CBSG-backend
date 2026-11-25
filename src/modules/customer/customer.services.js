import mongoose from "mongoose";
import { deleteFromS3, uploadToS3 } from "../../utils/s3.js";
import { toCustomerDetailDto, toCustomerDto, toCustomerPageDto } from "./customer.dto.js";
import { applyBankFields } from "./bank/customer-bank.dto.js";
import {
  adjustTotals,
  findById as findAgentById,
} from "../agent/agent.repository.js";
import {
  create,
  deleteById,
  findById,
  findPage,
  findRecentSavings,
  sumSavings,
  sumSavingsByCustomerIds,
  updateById,
} from "./customer.repository.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DETAIL_SAVING_LIMIT = 5;
const MAX_LIMIT = 50;

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid customer id");
  }
};

const handleDuplicate = (error) => {
  if (error?.code !== 11000) throw error;
  throw httpError(409, "Phone number already exists");
};

const FILE_FIELDS = [
  { input: "photo", key: "photo", folder: "customers" },
  { input: "aadharDocument", key: "aadharDocument", folder: "customers/aadhar" },
  { input: "panDocument", key: "panDocument", folder: "customers/pan" },
];

const uploadDocuments = async (files = {}) => {
  const saved = {};
  const urls = [];

  try {
    for (const field of FILE_FIELDS) {
      const file = files[field.input]?.[0];
      if (!file) continue;

      const url = await uploadToS3(file, field.folder);
      saved[field.key] = url;
      urls.push(url);
    }

    return saved;
  } catch (error) {
    await Promise.all(urls.map((url) => deleteFromS3(url)));
    throw error;
  }
};

const deleteFiles = (urls) => {
  return Promise.all(urls.filter(Boolean).map((url) => deleteFromS3(url)));
};

const blankToNull = (data, keys) => {
  for (const key of keys) {
    if (data[key] === "") data[key] = null;
  }
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

const assertAgentSession = (agentId) => {
  if (!mongoose.Types.ObjectId.isValid(agentId)) {
    throw httpError(401, "Invalid agent session");
  }
};

const assertOwnCustomer = (customer, agentId) => {
  if (!customer || customer.agentId?.toString() !== agentId.toString()) {
    throw httpError(404, "Customer not found");
  }
};

const getCustomers = async (agentId, query) => {
  assertAgentSession(agentId);

  const { page, limit } = pageFrom(query);
  const [customers, total] = await findPage(agentId, page, limit);
  const balances = await sumSavingsByCustomerIds(
    customers.map((customer) => customer._id)
  );

  return toCustomerPageDto(customers, balances, {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  });
};

const getCustomerById = async (agentId, id, query = {}) => {
  assertAgentSession(agentId);
  assertId(id);

  const customer = await findById(id);
  assertOwnCustomer(customer, agentId);

  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);
  const savingPage = Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE;
  const savingLimit =
    Number.isInteger(limit) && limit > 0
      ? Math.min(limit, MAX_LIMIT)
      : DETAIL_SAVING_LIMIT;

  const [totalSaved, [items, total]] = await Promise.all([
    sumSavings(customer._id),
    findRecentSavings(customer._id, savingPage, savingLimit),
  ]);

  return toCustomerDetailDto(customer, totalSaved, {
    items,
    pagination: {
      page: savingPage,
      limit: savingLimit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / savingLimit),
    },
  });
};

const createCustomer = async (agentId, data, files) => {
  if (!mongoose.Types.ObjectId.isValid(agentId)) {
    throw httpError(401, "Invalid agent session");
  }

  const agent = await findAgentById(agentId);

  if (!agent) {
    throw httpError(401, "Invalid agent session");
  }

  delete data.agentId;

  const uploads = await uploadDocuments(files);
  blankToNull(data, [
    "email",
    "photo",
    "fathersName",
    "dob",
    "pinCode",
    "aadhar",
    "pan",
    "nominee",
    "nomineeRelation",
    "bankName",
    "accountNumber",
    "ifscCode",
  ]);

  const bank = applyBankFields({}, data);

  if (bank) Object.assign(data, bank);

  try {
    const customer = await create({
      ...data,
      agentId,
      email: data.email || null,
      photo: uploads.photo || data.photo || null,
      aadharDocument: uploads.aadharDocument || null,
      panDocument: uploads.panDocument || null,
    });

    await adjustTotals(agentId, { customers: 1 });
    return toCustomerDto(customer);
  } catch (error) {
    await deleteFiles(Object.values(uploads));
    handleDuplicate(error);
  }
};

const updateCustomer = async (agentId, id, data, files) => {
  assertAgentSession(agentId);
  assertId(id);
  delete data.agentId;

  const customer = await findById(id);
  assertOwnCustomer(customer, agentId);

  const uploads = await uploadDocuments(files);
  blankToNull(data, [
    "email",
    "photo",
    "fathersName",
    "dob",
    "pinCode",
    "aadhar",
    "pan",
    "nominee",
    "nomineeRelation",
    "bankName",
    "accountNumber",
    "ifscCode",
  ]);

  const bank = applyBankFields(customer, data);

  if (bank) Object.assign(data, bank);

  if (!customer.isFistTime) {
    data.isFistTime = true;
  }

  const replaced = [];

  for (const field of FILE_FIELDS) {
    if (!uploads[field.key]) continue;
    if (customer[field.key]) replaced.push(customer[field.key]);
    data[field.key] = uploads[field.key];
  }

  try {
    const updated = await updateById(id, data);
    await deleteFiles(replaced);
    return toCustomerDto(updated);
  } catch (error) {
    await deleteFiles(Object.values(uploads));
    handleDuplicate(error);
  }
};

const deleteCustomer = async (agentId, id) => {
  assertAgentSession(agentId);
  assertId(id);

  const customer = await findById(id);
  assertOwnCustomer(customer, agentId);

  const deleted = await deleteById(id);

  await deleteFiles([
    deleted.photo,
    deleted.aadharDocument,
    deleted.panDocument,
  ]);

  await adjustTotals(agentId, {
    customers: -1,
    saving: -(deleted.totalSaving || 0),
  });

  return toCustomerDto(deleted);
};

export {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
