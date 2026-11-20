import mongoose from "mongoose";
import { deleteFromS3, uploadToS3 } from "../../utils/s3.js";
import { toAgentDto, toAgentListDto } from "./agent.dto.js";
import {
  create,
  deleteById,
  findAll,
  findById,
  findLevel,
  updateById,
} from "./agent.repository.js";

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid agent id");
  }
};

const levelModelFor = (role) => {
  return role === "executive_manager"
    ? "ExecutiveManagerLevel"
    : "TeamLeadLevel";
};

const assertLevel = async (role, levelId) => {
  if (!levelId) return;

  const level = await findLevel(role, levelId);

  if (!level) {
    throw httpError(404, "Level not found");
  }
};

const handleDuplicate = (error) => {
  if (error?.code !== 11000) throw error;

  const field = Object.keys(error.keyPattern || {})[0];
  const label = field === "phone" ? "Phone number" : "Email";
  throw httpError(409, `${label} already exists`);
};

const getAllAgents = async () => {
  const agents = await findAll();
  return toAgentListDto(agents);
};

const getAgentById = async (id) => {
  assertId(id);

  const agent = await findById(id);

  if (!agent) {
    throw httpError(404, "Agent not found");
  }

  return toAgentDto(agent);
};

const createAgent = async (data, file) => {
  const role = data.role || "team_lead";
  await assertLevel(role, data.levelId);

  const photo = file ? await uploadToS3(file, "agents") : data.photo || null;

  try {
    const agent = await create({
      ...data,
      photo,
      role,
      levelModel: levelModelFor(role),
    });

    return toAgentDto(agent);
  } catch (error) {
    if (file && photo) {
      await deleteFromS3(photo);
    }
    handleDuplicate(error);
  }
};

const updateAgent = async (id, data, file) => {
  assertId(id);

  const agent = await findById(id);

  if (!agent) {
    throw httpError(404, "Agent not found");
  }

  const role = data.role || agent.role;

  if (data.role && data.role !== agent.role && data.levelId === undefined) {
    data.levelId = null;
  }

  const levelId = data.levelId === undefined ? agent.levelId : data.levelId;
  await assertLevel(role, levelId);

  const photo = file ? await uploadToS3(file, "agents") : undefined;

  data.role = role;
  data.levelModel = levelModelFor(role);
  if (photo) data.photo = photo;

  try {
    const updated = await updateById(id, data);

    if (photo && agent.photo) {
      await deleteFromS3(agent.photo);
    }

    return toAgentDto(updated);
  } catch (error) {
    if (photo) {
      await deleteFromS3(photo);
    }
    handleDuplicate(error);
  }
};

const deleteAgent = async (id) => {
  assertId(id);

  const agent = await deleteById(id);

  if (!agent) {
    throw httpError(404, "Agent not found");
  }

  if (agent.photo) {
    await deleteFromS3(agent.photo);
  }

  return toAgentDto(agent);
};

export {
  getAllAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
};
