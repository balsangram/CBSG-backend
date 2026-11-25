import mongoose from "mongoose";
import { deleteFromS3, uploadToS3 } from "../../utils/s3.js";
import { toAgentDto, toAgentListDto } from "./agent.dto.js";
import {
  create,
  deleteById,
  findAll,
  findBranch,
  findById,
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

const assertTeamLead = async (teamLeadId) => {
  if (!teamLeadId) return;

  const lead = await findById(teamLeadId);

  if (!lead || lead.role !== "team_lead") {
    throw httpError(404, "Team lead not found");
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

  await assertBranch(data.branchId);
  await assertTarget(data.targetId);
  await assertTeamLead(data.teamLeadId);

  const photo = file ? await uploadToS3(file, "agents") : data.photo || null;

  try {
    const agent = await create({
      ...data,
      photo,
      role,
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

  const branchId = data.branchId === undefined ? agent.branchId : data.branchId;
  const targetId = data.targetId === undefined ? agent.targetId : data.targetId;
  let teamLeadId =
    data.teamLeadId === undefined ? agent.teamLeadId : data.teamLeadId;

  // Hierarchy rules:
  // - team_lead never reports to another agent
  // - executive_manager must report to a team lead
  // - an agent can never report to itself
  if (role === "team_lead") {
    teamLeadId = null;
  } else if (role === "executive_manager" && !teamLeadId) {
    throw httpError(400, "Executive manager must report to a team lead");
  }

  if (teamLeadId && String(teamLeadId) === String(id)) {
    throw httpError(400, "An agent cannot report to themselves");
  }

  await assertBranch(branchId);
  await assertTarget(targetId);
  await assertTeamLead(teamLeadId);

  data.teamLeadId = teamLeadId;

  const photo = file ? await uploadToS3(file, "agents") : undefined;

  data.role = role;
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
