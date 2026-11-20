import asyncHandler from "../../utils/asyncHandler.js";
import apiResponse from "../../utils/apiResponse.js";
import {
  createCustomer as createCustomerService,
  deleteCustomer as deleteCustomerService,
  getCustomerById as getCustomerByIdService,
  getCustomers as getCustomersService,
  updateCustomer as updateCustomerService,
} from "./customer.services.js";

const getCustomers = asyncHandler(async (req, res) => {
  const data = await getCustomersService();
  return apiResponse(res, 200, "Customers fetched successfully", data);
});

const getCustomerById = asyncHandler(async (req, res) => {
  const data = await getCustomerByIdService(req.params.id);
  return apiResponse(res, 200, "Customer fetched successfully", data);
});

const createCustomer = asyncHandler(async (req, res) => {
  const data = await createCustomerService(req.body, req.files);
  return apiResponse(res, 201, "Customer created successfully", data);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const data = await updateCustomerService(req.params.id, req.body, req.files);
  return apiResponse(res, 200, "Customer updated successfully", data);
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const data = await deleteCustomerService(req.params.id);
  return apiResponse(res, 200, "Customer deleted successfully", data);
});

export {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
