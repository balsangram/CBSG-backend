
import mongoose from "mongoose";

const interestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    interest: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSavingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Interest = mongoose.model("Interest", interestSchema);

export default Interest;
