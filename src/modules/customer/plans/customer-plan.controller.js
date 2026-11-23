import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import { getActivePlans } from "./customer-plan.services.js";

const plans = asyncHandler(async (req, res) => {
  const data = await getActivePlans();
  return apiResponse(res, 200, "Plans fetched successfully", data);
});

export { plans };
