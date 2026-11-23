import { findNotificationsByRole } from "../../notifications/notification.repositories.js";
import { toCustomerNotificationListDto } from "./customer-notification.dto.js";

const CUSTOMER_NOTIFICATION_ROLE = "USER";

const getCustomerNotifications = async () => {
  const notifications = await findNotificationsByRole(CUSTOMER_NOTIFICATION_ROLE);
  return toCustomerNotificationListDto(notifications);
};

export { getCustomerNotifications };
