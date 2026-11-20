
import admin from "../config/firebase.js";

const sendNotification = async ({
  token,
  title,
  body,
  data = {},
}) => {
  try {
    if (!token) {
      throw new Error("FCM device token is required");
    }

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          String(value),
        ])
      ),
    };

    const response = await admin.messaging().send(message);

    return {
      success: true,
      message: "Notification sent successfully",
      messageId: response,
    };
  } catch (error) {
    console.error("FCM Notification Error:", error.message);
    throw error;
  }
};

export default sendNotification;
