import mongoose from "mongoose";

const targetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    customer: {
      type: Number,
      required: true,
      min: 0,
    },
    prize: {
      type: String,
      required: true,
      trim: true,
    },
    levelNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: [/^L\d+$/, "Level number must look like L1 or L2"],
    },
    role: {
      type: String,
      required: true,
      enum: ["ExecutiveManagerLevel", "TeamLeadLevel"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Target", targetSchema);