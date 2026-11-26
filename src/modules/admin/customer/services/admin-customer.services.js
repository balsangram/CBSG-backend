import mongoose from "mongoose";
import { deleteFromS3, uploadToS3 } from "../../../../utils/s3.js";
import { adjustTotals, findById as findAgentById } from "../../../agent/agent.repository.js";
import { toAdminCustomerDto, toAdminCustomerListDto } from "../dto/admin-customer.dto.js";
import {
  create,
  deleteById,
  findAll,
  findById,
  findKycStatuses,
  updateById,
} from "../repository/admin-customer.repository.js";

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

const assertAgent = async (agentId) => {
  if (!mongoose.Types.ObjectId.isValid(agentId)) {
    throw httpError(400, "Executive is required");
  }

  const agent = await findAgentById(agentId);

  if (!agent) {
    throw httpError(404, "Executive not found");
  }

  return agent;
};

const FILE_FIELDS = [
  { input: "photo", key: "photo", folder: "customers" },
  { input: "aadharDocument", key: "aadharDocument", folder: "customers/aadhar" },
  { input: "panDocument", key: "panDocument", folder: "customers/pan" },
];

const BLANKABLE = [
  "email",
  "address",
  "aadhar",
  "pan",
  "bankName",
  "accountNumber",
  "ifscCode",
  "nominee",
  "nomineeRelation",
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

const blankToNull = (data) => {
  BLANKABLE.forEach((key) => {
    if (data[key] === "") data[key] = null;
  });
};

const getCustomers = async () => {
  const customers = await findAll();
  const kycByCustomerId = await findKycStatuses(customers.map((customer) => customer._id));
  return toAdminCustomerListDto(customers, kycByCustomerId);
};

const getCustomerById = async (id) => {
  assertId(id);

  const customer = await findById(id);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  const kycByCustomerId = await findKycStatuses([customer._id]);
  return toAdminCustomerDto(customer, kycByCustomerId.get(String(customer._id)));
};

const createCustomer = async (data, file) => {
  await assertAgent(data.agentId);
  blankToNull(data);

  const photo = file ? await uploadToS3(file, "customers") : data.photo || null;

  try {
    const customer = await create({
      ...data,
      email: data.email || null,
      photo,
    });
    const saved = await findById(customer._id);
    const kycByCustomerId = await findKycStatuses([saved._id]);

    await adjustTotals(data.agentId, { customers: 1 });
    return toAdminCustomerDto(saved, kycByCustomerId.get(String(saved._id)));
  } catch (error) {
    if (photo && file) await deleteFromS3(photo);
    handleDuplicate(error);
  }
};

const updateCustomer = async (id, data, files) => {
  assertId(id);

  const customer = await findById(id);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  if (data.agentId) await assertAgent(data.agentId);

  blankToNull(data);

  const uploads = await uploadDocuments(files);
  Object.assign(data, uploads);

  const previousAgentId = customer.agentId?._id || customer.agentId;
  const nextAgentId = data.agentId || previousAgentId;

  try {
    const updated = await updateById(id, data);

    await Promise.all(
      FILE_FIELDS.map((field) =>
        uploads[field.key] ? deleteFromS3(customer[field.key]) : null
      )
    );

    if (String(previousAgentId) !== String(nextAgentId)) {
      await adjustTotals(previousAgentId, {
        customers: -1,
        saving: -(customer.totalSaving || 0),
      });
      await adjustTotals(nextAgentId, {
        customers: 1,
        saving: customer.totalSaving || 0,
      });
    }

    const kycByCustomerId = await findKycStatuses([updated._id]);
    return toAdminCustomerDto(updated, kycByCustomerId.get(String(updated._id)));
  } catch (error) {
    await Promise.all(Object.values(uploads).map((url) => deleteFromS3(url)));
    handleDuplicate(error);
  }
};

const deleteCustomer = async (id) => {
  assertId(id);

  const customer = await findById(id);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  const deleted = await deleteById(id);
  const agentId = customer.agentId?._id || customer.agentId;

  await Promise.all([
    deleteFromS3(deleted.photo),
    deleteFromS3(deleted.aadharDocument),
    deleteFromS3(deleted.panDocument),
  ]);
  await adjustTotals(agentId, {
    customers: -1,
    saving: -(deleted.totalSaving || 0),
  });

  return { id: deleted._id };
};

export {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
};
