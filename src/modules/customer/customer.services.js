import mongoose from "mongoose";
import { deleteFromS3, uploadToS3 } from "../../utils/s3.js";
import { toCustomerDto, toCustomerListDto } from "./customer.dto.js";
import {
  create,
  deleteById,
  findAll,
  findById,
  updateById,
} from "./customer.repository.js";

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

const getCustomers = async () => {
  const customers = await findAll();
  return toCustomerListDto(customers);
};

const getCustomerById = async (id) => {
  assertId(id);

  const customer = await findById(id);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  return toCustomerDto(customer);
};

const createCustomer = async (data, files) => {
  const uploads = await uploadDocuments(files);
  blankToNull(data, [
    "email",
    "photo",
    "fathersName",
    "dob",
    "pinCode",
    "aadhar",
    "pan",
    "bankName",
    "accountNumber",
    "ifscCode",
  ]);

  try {
    const customer = await create({
      ...data,
      email: data.email || null,
      photo: uploads.photo || data.photo || null,
      aadharDocument: uploads.aadharDocument || null,
      panDocument: uploads.panDocument || null,
    });

    return toCustomerDto(customer);
  } catch (error) {
    await deleteFiles(Object.values(uploads));
    handleDuplicate(error);
  }
};

const updateCustomer = async (id, data, files) => {
  assertId(id);

  const customer = await findById(id);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  const uploads = await uploadDocuments(files);
  blankToNull(data, [
    "email",
    "photo",
    "fathersName",
    "dob",
    "pinCode",
    "aadhar",
    "pan",
    "bankName",
    "accountNumber",
    "ifscCode",
  ]);

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

const deleteCustomer = async (id) => {
  assertId(id);

  const customer = await deleteById(id);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  await deleteFiles([
    customer.photo,
    customer.aadharDocument,
    customer.panDocument,
  ]);

  return toCustomerDto(customer);
};

export {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
