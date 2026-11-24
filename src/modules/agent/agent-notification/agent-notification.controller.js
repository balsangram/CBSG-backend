import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import { getAgentNotifications as getAgentNotificationsService } from "./agent-notification.services.js";

const notifications = asyncHandler(async (req, res) => {
  const data = await getAgentNotificationsService(req.user.role, req.query);
  return apiResponse(res, 200, "Notifications fetched successfully", data);
});

export { notifications };
