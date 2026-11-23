import { findNotificationsPage } from "../../notifications/notification.repositories.js";
import { toCustomerNotificationPageDto } from "./customer-notification.dto.js";

const CUSTOMER_NOTIFICATION_ROLE = "USER";
const PAGE_SIZE = 15;

const pageFrom = (query = {}) => {
  const page = Number.parseInt(query.page, 10);

  return Number.isInteger(page) && page > 0 ? page : 1;
};

const getCustomerNotifications = async (query) => {
  const page = pageFrom(query);
  const [notifications, total] = await findNotificationsPage(
    { role: CUSTOMER_NOTIFICATION_ROLE },
    page,
    PAGE_SIZE
  );

  return toCustomerNotificationPageDto(notifications, {
    page,
    limit: PAGE_SIZE,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / PAGE_SIZE),
  });
};

export { getCustomerNotifications };
