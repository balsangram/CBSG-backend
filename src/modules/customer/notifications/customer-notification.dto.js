const toCustomerNotificationDto = (notification) => ({
  id: notification._id,
  role: notification.role,
  heading: notification.heading,
  body: notification.body,
  type: notification.type,
  isRead: Boolean(notification.isRead),
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

const toCustomerNotificationListDto = (notifications) => {
  return notifications.map(toCustomerNotificationDto);
};

export { toCustomerNotificationDto, toCustomerNotificationListDto };
