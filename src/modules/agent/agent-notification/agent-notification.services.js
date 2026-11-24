import { findNotificationsPage } from "../../notifications/notification.repositories.js";
import { toAgentNotificationPageDto } from "./agent-notification.dto.js";

const PAGE_SIZE = 15;

const NOTIFICATION_ROLE = {
  executive_manager: "MANAGER",
  team_lead: "TEAM_LEAD",
};

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const pageFrom = (query = {}) => {
  const page = Number.parseInt(query.page, 10);

  return Number.isInteger(page) && page > 0 ? page : 1;
};

const getAgentNotifications = async (role, query) => {
  const notificationRole = NOTIFICATION_ROLE[role];

  if (!notificationRole) {
    throw httpError(403, "Notifications are not available for this role");
  }

  const page = pageFrom(query);
  const [notifications, total] = await findNotificationsPage(
    { role: notificationRole },
    page,
    PAGE_SIZE,
  );

  return toAgentNotificationPageDto(notifications, {
    page,
    limit: PAGE_SIZE,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / PAGE_SIZE),
  });
};

export { getAgentNotifications };
