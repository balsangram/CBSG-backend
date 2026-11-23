import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "STAFF", "USER"],
      required: true,
    },

    heading: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "INFO",
        "SUCCESS",
        "WARNING",
        "ERROR",
        "PAYMENT",
        "BOOKING",
        "KYC",
        "SYSTEM",
      ],
      default: "INFO",
    }
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ role: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;