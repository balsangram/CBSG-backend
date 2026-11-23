import Notification from "../../model/Notification.model.js";

const findNotifications = (filter = {}) => {
  return Notification.find(filter).sort({ createdAt: -1 });
};

const findNotificationsByRole = (role) => {
  return findNotifications({ role });
};

const findNotificationById = (id) => Notification.findById(id);

const createNotification = (data) => Notification.create(data);

const updateNotificationById = (id, data) => {
  return Notification.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const markNotificationRead = (id, isRead = true) => {
  return updateNotificationById(id, { isRead });
};

const deleteNotificationById = (id) => Notification.findByIdAndDelete(id);

export {
  findNotifications,
  findNotificationsByRole,
  findNotificationById,
  createNotification,
  updateNotificationById,
  markNotificationRead,
  deleteNotificationById,
};
