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

const createCustomer = async (data, file) => {
  const photo = file ? await uploadToS3(file, "customers") : data.photo || null;

  try {
    const customer = await create({
      ...data,
      email: data.email || null,
      photo,
    });

    return toCustomerDto(customer);
  } catch (error) {
    if (file && photo) {
      await deleteFromS3(photo);
    }
    handleDuplicate(error);
  }
};

const updateCustomer = async (id, data, file) => {
  assertId(id);

  const customer = await findById(id);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  const photo = file ? await uploadToS3(file, "customers") : undefined;

  if (photo) data.photo = photo;
  if (data.email === "") data.email = null;

  try {
    const updated = await updateById(id, data);

    if (photo && customer.photo) {
      await deleteFromS3(customer.photo);
    }

    return toCustomerDto(updated);
  } catch (error) {
    if (photo) {
      await deleteFromS3(photo);
    }
    handleDuplicate(error);
  }
};

const deleteCustomer = async (id) => {
  assertId(id);

  const customer = await deleteById(id);

  if (!customer) {
    throw httpError(404, "Customer not found");
  }

  if (customer.photo) {
    await deleteFromS3(customer.photo);
  }

  return toCustomerDto(customer);
};

export {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
