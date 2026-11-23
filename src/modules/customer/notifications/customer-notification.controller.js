import asyncHandler from "../../../utils/asyncHandler.js";
import apiResponse from "../../../utils/apiResponse.js";
import { getCustomerNotifications as getCustomerNotificationsService } from "./customer-notification.services.js";

const notifications = asyncHandler(async (req, res) => {
  const data = await getCustomerNotificationsService();
  return apiResponse(res, 200, "Notifications fetched successfully", data);
});

export { notifications };
