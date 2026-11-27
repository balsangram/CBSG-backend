import Notification from "../../model/Notification.model.js";

const findNotifications = (filter = {}) => {
  return Notification.find(filter).sort({ createdAt: -1 });
};

const findNotificationsByRole = (role) => {
  return findNotifications({ role });
};

const findNotificationsPage = (filter, page, limit) => {
  const skip = (page - 1) * limit;

  return Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);
};

const findNotificationById = (id) => Notification.findById(id);

const createNotification = (data) => Notification.create(data);

const updateNotificationById = (id, data) => {
  return Notification.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
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
  findNotificationsPage,
  findNotificationById,
  createNotification,
  updateNotificationById,
  markNotificationRead,
  deleteNotificationById,
};
