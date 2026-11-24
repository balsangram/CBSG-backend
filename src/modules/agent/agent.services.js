import mongoose from "mongoose";
import { deleteFromS3, uploadToS3 } from "../../utils/s3.js";
import { toAgentDto, toAgentListDto } from "./agent.dto.js";
import {
  create,
  deleteById,
  findAll,
  findBranch,
  findById,
  findLevel,
  findTarget,
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

const assertBranch = async (branchId) => {
  if (!branchId) return;

  const branch = await findBranch(branchId);

  if (!branch) {
    throw httpError(404, "Branch not found");
  }
};

const assertTarget = async (targetId) => {
  if (!targetId) return;

  const target = await findTarget(targetId);

  if (!target) {
    throw httpError(404, "Target not found");
  }
};

const handleDuplicate = (error) => {
  if (error?.code !== 11000) throw error;

  const field = Object.keys(error.keyPattern || {})[0];
  const labels = {
    phone: "Phone number",
    employeeId: "Employee id",
  };
  const label = labels[field] || "Email";
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
  await assertBranch(data.branchId);
  await assertTarget(data.targetId);

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
  const branchId = data.branchId === undefined ? agent.branchId : data.branchId;
  const targetId = data.targetId === undefined ? agent.targetId : data.targetId;
  await assertLevel(role, levelId);
  await assertBranch(branchId);
  await assertTarget(targetId);

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
