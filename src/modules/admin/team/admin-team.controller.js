import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import { buildTeamTree } from "./admin-team.services.js";
import { findAgents, findCustomersByAgentIds } from "./admin-team.repository.js";

const getTeamTree = asyncHandler(async (req, res) => {
  const data = await buildTeamTree({ findAgents, findCustomersByAgentIds });
  return apiResponse(res, 200, "Team tree fetched successfully", data);
});

export { getTeamTree };
