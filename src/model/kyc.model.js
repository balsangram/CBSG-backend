
import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    // Customer submitting KYC
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
    },

    // Admin who verified KYC
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    // Personal details verification
    personalDetails: {
      type: Boolean,
      default: false,
    },

    // Address verification
    address: {
      type: Boolean,
      default: false,
    },

    // Aadhaar and PAN verification
    aadhaarPan: {
      type: Boolean,
      default: false,
    },

    // Bank account verification
    bankAccount: {
      type: Boolean,
      default: false,
    },

    // Overall KYC status
    status: {
      type: String,
      enum: [
        "PENDING",
        "IN_PROGRESS",
        "UNDER_REVIEW",
        "VERIFIED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

  },
  {
    timestamps: true,
  }
);

const KYC = mongoose.model("KYC", kycSchema);

export default KYC;
