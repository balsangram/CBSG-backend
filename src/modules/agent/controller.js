import asyncHandler from "../../utils/asyncHandler.js";
import apiResponse from "../../utils/apiResponse.js";
import {
  createAgent as createAgentService,
  deleteAgent as deleteAgentService,
  getAgentById as getAgentByIdService,
  getAllAgents as getAllAgentsService,
  updateAgent as updateAgentService,
} from "./agent.services.js";

const getAllAgents = asyncHandler(async (req, res) => {
  const data = await getAllAgentsService();
  return apiResponse(res, 200, "Agents fetched successfully", data);
});

const getAgentById = asyncHandler(async (req, res) => {
  const data = await getAgentByIdService(req.params.id);
  return apiResponse(res, 200, "Agent fetched successfully", data);
});

const createAgent = asyncHandler(async (req, res) => {
  const data = await createAgentService(req.body, req.file);
  return apiResponse(res, 201, "Agent created successfully", data);
});

const updateAgent = asyncHandler(async (req, res) => {
  const data = await updateAgentService(req.params.id, req.body, req.file);
  return apiResponse(res, 200, "Agent updated successfully", data);
});

const deleteAgent = asyncHandler(async (req, res) => {
  const data = await deleteAgentService(req.params.id);
  return apiResponse(res, 200, "Agent deleted successfully", data);
});

export {
  getAllAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
};
