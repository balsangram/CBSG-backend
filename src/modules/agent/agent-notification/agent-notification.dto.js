const toAgentNotificationDto = (notification) => ({
  id: notification._id,
  role: notification.role,
  heading: notification.heading,
  body: notification.body,
  type: notification.type,
  isRead: Boolean(notification.isRead),
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

const toAgentNotificationPageDto = (notifications, pagination) => ({
  notifications: notifications.map(toAgentNotificationDto),
  pagination,
});

export { toAgentNotificationDto, toAgentNotificationPageDto };
