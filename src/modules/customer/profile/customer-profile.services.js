import mongoose from "mongoose";
import { deleteFromS3, uploadToS3 } from "../../../utils/s3.js";
import { toProfileDto } from "./customer-profile.dto.js";
import {
  deleteProfileById,
  findProfileById,
  updateProfileById,
} from "./customer-profile.repository.js";

const FILE_FIELDS = [
  { input: "photo", key: "photo", folder: "customers" },
  { input: "aadharDocument", key: "aadharDocument", folder: "customers/aadhar" },
  { input: "panDocument", key: "panDocument", folder: "customers/pan" },
];

const NULLABLE = [
  "email",
  "photo",
  "fathersName",
  "dob",
  "address",
  "pinCode",
  "aadhar",
  "aadharDocument",
  "pan",
  "panDocument",
  "bankName",
  "accountNumber",
  "ifscCode",
];

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

const blankToNull = (data) => {
  for (const key of NULLABLE) {
    if (data[key] === "") data[key] = null;
  }
};

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

const handleDuplicate = (error) => {
  if (error?.code !== 11000) throw error;
  throw httpError(409, "Phone number already exists");
};

const getCustomerOrThrow = async (customerId) => {
  assertCustomerId(customerId);
  const customer = await findProfileById(customerId);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  return customer;
};

const afterLogin = async (customerId, data, files) => {
  const customer = await getCustomerOrThrow(customerId);

  blankToNull(data);

  const uploads = await uploadDocuments(files);
  const replaced = [];

  for (const field of FILE_FIELDS) {
    if (!uploads[field.key]) continue;
    if (customer[field.key]) replaced.push(customer[field.key]);
    data[field.key] = uploads[field.key];
  }

  for (const field of FILE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(data, field.key)) continue;
    if (uploads[field.key]) continue;
    if (customer[field.key] && customer[field.key] !== data[field.key]) {
      replaced.push(customer[field.key]);
    }
  }

  const hasUpdate = [...NULLABLE, "name", "phone", "joiningDate"].some((key) =>
    Object.prototype.hasOwnProperty.call(data, key)
  );

  if (!hasUpdate) {
    await deleteFiles(Object.values(uploads));
    throw httpError(400, "At least one field is required");
  }

  try {
    const updated = await updateProfileById(customerId, {
      ...data,
      isFistTime: true,
    });
    await deleteFiles(replaced);
    return toProfileDto(updated);
  } catch (error) {
    await deleteFiles(Object.values(uploads));
    handleDuplicate(error);
  }
};

const getProfile = async (customerId) => {
  const customer = await getCustomerOrThrow(customerId);
  return toProfileDto(customer);
};

const deleteProfile = async (customerId) => {
  assertCustomerId(customerId);
  const customer = await deleteProfileById(customerId);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  await deleteFiles([
    customer.photo,
    customer.aadharDocument,
    customer.panDocument,
  ]);

  return { id: customer._id };
};

export { afterLogin, deleteProfile, getProfile };
